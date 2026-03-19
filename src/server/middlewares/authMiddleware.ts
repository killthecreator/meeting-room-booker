import type { RequestHandler } from "express";
import { AuthenticationError } from "../lib/customErrors";
import { getAuthToken } from "../routes/auth/utils/getAuthToken";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  if (!getAuthToken(req)) throw new AuthenticationError("Unauthorized");
  next();
};
