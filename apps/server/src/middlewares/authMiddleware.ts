import type { RequestHandler } from "express";

import { verifyAuthToken } from "../utils/verifyAuthToken";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  await verifyAuthToken(req);

  next();
};
