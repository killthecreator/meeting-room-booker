import type { ErrorRequestHandler } from "express";

export const errorLogger: ErrorRequestHandler = (err, _req, _res, next) => {
  console.error(err);
  next(err);
};
