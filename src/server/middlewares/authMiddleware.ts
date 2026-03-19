import type { RequestHandler } from "express";
import { AutherntificationError } from "../lib/customErrors";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  if (!req.cookies?.session) throw new AutherntificationError("Unauthorized");
  next();
};
