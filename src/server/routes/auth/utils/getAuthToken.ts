import type { Request } from "express";

export const getAuthToken = (req: Request): string | undefined =>
  req.cookies?.session ||
  (req.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
