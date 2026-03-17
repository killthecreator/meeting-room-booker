/**
 * Google OAuth 2.0 / OpenID Connect auth routes.
 * Optionally restricts sign-in to a Google Workspace domain via ALLOWED_GOOGLE_DOMAIN.
 *
 * Env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,
 *      ALLOWED_GOOGLE_DOMAIN (optional), SESSION_SECRET, FRONTEND_ORIGIN
 */
import { Router, type Request } from "express";
import crypto from "crypto";
import type { AuthUser } from "../types/AuthUser.type";

const router = Router();

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

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], "base64url").toString());
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
router.get("/google", (req, res) => {
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
router.get("/google/callback", async (req, res) => {
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

/** GET /api/auth/me — return current user from session (cookie or Bearer token) */
router.get("/me", (req, res) => {
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
router.post("/logout", (_req, res) => {
  res.clearCookie("session", { path: "/" });
  res.json({ ok: true });
});

export default router;
