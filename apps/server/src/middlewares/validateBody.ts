import type { RequestHandler } from "express";
import { STATUS_CODES } from "http";
import z from "zod";
import { ZodError } from "zod";

export const validateBodyMiddleware = (schema: z.ZodObject): RequestHandler => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const tree = z.treeifyError(error);
        const errorMessages = tree.errors.map((message) => ({
          message,
        }));

        res.status(400).json({
          error: STATUS_CODES[400],
          details: errorMessages,
        });
      } else {
        res.status(500).json({ error: STATUS_CODES[500] });
      }
    }
  };
};
