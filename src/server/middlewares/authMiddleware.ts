import type { RequestHandler } from "express";
import { getAuthToken } from "../routes/auth/utils/getAuthToken";
import { AuthenticationError } from "../lib/customErrors";

export const authMiddleware: RequestHandler = (req, _res, next) => {
  if (!getAuthToken(req)) throw new AuthenticationError("Unauthorized");
  next();
};
