import type { RequestHandler } from "express";

import { getAuthToken } from "../utils/getAuthToken";
import { AuthenticationError } from "../lib/customErrors";
import { authService } from "../routes/auth/auth.service";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  const authToken = getAuthToken(req);
  if (!authToken) throw new AuthenticationError("Unauthorized");
  await authService.verifyToken(authToken);

  next();
};
