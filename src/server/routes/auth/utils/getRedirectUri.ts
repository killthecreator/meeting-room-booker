import type { Request } from "express";

const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

export function getRedirectUri(req: Request): string {
  if (GOOGLE_REDIRECT_URI) return GOOGLE_REDIRECT_URI;
  const host = req.get("host") || "localhost:3001";
  const proto = req.get("x-forwarded-proto") || req.protocol || "http";
  return `${proto}://${host}/api/auth/google/callback`;
}
