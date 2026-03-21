import type { Request } from "express";
import { SESSION_COOKIE_KEY } from "../../constants";

export const getAuthToken = (req: Request): string | undefined =>
  req.cookies?.[SESSION_COOKIE_KEY];
