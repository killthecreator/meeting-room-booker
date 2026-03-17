/**
 * Meeting room booker server.
 * Optionally restricts access to a specific network via ALLOWED_NETWORK (IPv4 CIDR).
 *
 * Env: ALLOWED_NETWORK (optional), PORT
 */
import express from "express";
import cookieParser from "cookie-parser";
import meetingRouter from "./meetingRouter";
import authRouter from "./authRouter";

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

app.use("/api/auth", authRouter);
app.use(express.static("dist", { index: false }));
app.use("/api/meetings", meetingRouter);

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log("Server listening on", PORT);
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ||
    `http://localhost:${PORT}/api/auth/google/callback`;
  console.log(
    "Google Redirect URI (set in Google Cloud Console):",
    redirectUri,
  );
  if (!process.env.ALLOWED_GOOGLE_DOMAIN) {
    console.warn(
      "ALLOWED_GOOGLE_DOMAIN not set — any Google account will be accepted.",
    );
  }
});
