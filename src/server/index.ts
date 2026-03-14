/**
 * Google OAuth 2.0 / OpenID Connect server.
 * Optionally restricts sign-in to a Google Workspace domain via ALLOWED_GOOGLE_DOMAIN.
 * Optionally restricts access to a specific network via ALLOWED_NETWORK (IPv4 CIDR, e.g. 192.168.1.0/24).
 *
 * Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
 *      ALLOWED_GOOGLE_DOMAIN (optional), ALLOWED_NETWORK (optional), SESSION_SECRET, FRONTEND_ORIGIN
 */
import express, { type Request } from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import type { AuthUser } from "../types/AuthUser.type";

const app = express();
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** Parse ALLOWED_NETWORK (comma-separated IPv4 CIDRs, e.g. "192.168.1.0/24,10.0.0.0/8"). Empty = allow all. */
const ALLOWED_NETWORK = process.env.ALLOWED_NETWORK?.trim();
const allowedCidrs: { network: number; mask: number }[] = [];
if (ALLOWED_NETWORK) {
  for (const cidr of ALLOWED_NETWORK.split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const match = cidr.match(
      /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/,
    );
    if (!match) continue;
    const [, networkStr, prefixStr] = match;
    const prefix = Math.min(32, Math.max(0, parseInt(prefixStr!, 10)));
    const network = ipv4ToInt(networkStr!);
    const mask = prefix === 0 ? 0 : (0xffff_ffff << (32 - prefix)) >>> 0;
    allowedCidrs.push({ network: network & mask, mask });
  }
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4) return 0;
  return (parts[0]! << 24) | (parts[1]! << 16) | (parts[2]! << 8) | parts[3]!;
}

function isIpInAllowedNetwork(clientIp: string): boolean {
  if (allowedCidrs.length === 0) return true;
  const ip = ipv4ToInt(clientIp);
  return allowedCidrs.some(({ network, mask }) => (ip & mask) === network);
}

app.use((req, res, next) => {
  if (allowedCidrs.length === 0) return next();
  const clientIp = (
    req.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.ip ||
    ""
  ).replace(/^::ffff:/, "");
  if (!clientIp || !isIpInAllowedNetwork(clientIp)) {
    res
      .status(403)
      .send(
        "Access allowed only from the allowed network (e.g. office Wi‑Fi). Your IP is not in the allowed range.",
      );
    return;
  }
  next();
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const ALLOWED_GOOGLE_DOMAIN = process.env.ALLOWED_GOOGLE_DOMAIN;
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me-in-production";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const GOOGLE_AUTHORIZE = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";

const stateStore = new Map<string, { createdAt: number }>();

function signSession(payload: object): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(data);
  return (
    Buffer.from(data).toString("base64url") + "." + hmac.digest("base64url")
  );
}

function unsignSession(token: string): Record<string, string> | null {
  try {
    const [raw, sig] = token.split(".");
    const hmac = crypto.createHmac("sha256", SESSION_SECRET);
    hmac.update(Buffer.from(raw, "base64url").toString());
    if (hmac.digest("base64url") !== sig) return null;
    return JSON.parse(Buffer.from(raw, "base64url").toString());
  } catch {
    return null;
  }
}

/** Redirect URI for Google OAuth. Must match exactly what is set in Google Cloud Console. */
function getRedirectUri(req: Request): string {
  if (GOOGLE_REDIRECT_URI) return GOOGLE_REDIRECT_URI;
  const host = req.get("host") || "localhost:3001";
  const proto = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${proto}://${host}/api/auth/google/callback`;
}

/** GET /api/auth/google — redirect to Google Sign-in */
app.get("/api/auth/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).send("Google auth not configured (missing env).");
  }
  const redirectUri = getRedirectUri(req);
  if (!redirectUri.startsWith("http")) {
    return res
      .status(500)
      .send(
        "Google redirect URI not configured. Set GOOGLE_REDIRECT_URI in .env",
      );
  }
  const state = crypto.randomBytes(16).toString("hex");
  stateStore.set(state, { createdAt: Date.now() });
  const params = new URLSearchParams({
    response_type: "code",
    scope: "openid email profile",
    client_id: GOOGLE_CLIENT_ID,
    state,
    redirect_uri: redirectUri,
  });
  if (ALLOWED_GOOGLE_DOMAIN) {
    params.set("hd", ALLOWED_GOOGLE_DOMAIN);
  }
  res.redirect(`${GOOGLE_AUTHORIZE}?${params.toString()}`);
});

/** GET /api/auth/google/callback — exchange code, check domain, set session */
app.get("/api/auth/google/callback", async (req, res) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const error = req.query.error as string | undefined;

  if (error) {
    return res.redirect(
      FRONTEND_ORIGIN + "?error=" + encodeURIComponent(error),
    );
  }
  if (!state || !stateStore.has(state)) {
    return res.redirect(FRONTEND_ORIGIN + "?error=invalid_state");
  }
  stateStore.delete(state);
  if (!code) {
    return res.redirect(FRONTEND_ORIGIN + "?error=no_code");
  }

  const redirectUri = getRedirectUri(req);
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: GOOGLE_CLIENT_ID!,
    client_secret: GOOGLE_CLIENT_SECRET!,
  });

  const tokenRes = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  }).catch(() => null);

  if (!tokenRes || !tokenRes.ok) {
    return res.redirect(FRONTEND_ORIGIN + "?error=token_exchange_failed");
  }

  const data = (await tokenRes.json()) as { id_token?: string };
  if (!data.id_token) {
    return res.redirect(FRONTEND_ORIGIN + "?error=no_id_token");
  }

  const payload = decodeJwtPayload(data.id_token);
  if (!payload) {
    return res.redirect(FRONTEND_ORIGIN + "?error=invalid_token");
  }

  const domain = payload.hd as string | undefined;
  if (
    ALLOWED_GOOGLE_DOMAIN &&
    (!domain || domain.toLowerCase() !== ALLOWED_GOOGLE_DOMAIN.toLowerCase())
  ) {
    return res.redirect(FRONTEND_ORIGIN + "?error=domain_not_allowed");
  }

  const user = {
    sub: payload.sub,
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    ...(domain && { domain }),
  } as AuthUser;

  const sessionToken = signSession(user);
  res.cookie("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  const origin = new URL(FRONTEND_ORIGIN);
  const sameOrigin = req.get("host") === origin.host;
  if (sameOrigin) {
    res.redirect(FRONTEND_ORIGIN);
  } else {
    res.redirect(
      FRONTEND_ORIGIN + "#session=" + encodeURIComponent(sessionToken),
    );
  }
});

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64url").toString());
  } catch {
    return null;
  }
}

/** GET /api/auth/me — return current user from session (cookie or Bearer token) */
app.get("/api/auth/me", (req, res) => {
  const token =
    req.cookies?.session ||
    (req.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return res.status(401).json({ error: "Not signed in" });
  }
  const user = unsignSession(token);
  if (!user) {
    res.clearCookie("session", { path: "/" });
    return res.status(401).json({ error: "Invalid session" });
  }
  res.json(user);
});

/** POST /api/auth/logout */
app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("session", { path: "/" });
  res.json({ ok: true });
});

app.use(express.static("dist", { index: false }));

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log("Server listening on", PORT);
  const redirectUri =
    GOOGLE_REDIRECT_URI || `http://localhost:${PORT}/api/auth/google/callback`;
  console.log(
    "Google Redirect URI (set in Google Cloud Console):",
    redirectUri,
  );
  if (!ALLOWED_GOOGLE_DOMAIN) {
    console.warn(
      "ALLOWED_GOOGLE_DOMAIN not set — any Google account will be accepted.",
    );
  }
});
