import { Router } from "express";
import z from "zod";

import { authController } from "./auth.controller";
import { validateBodyMiddleware } from "../../middlewares/validateBody";

const router = Router();

router.post(
  "/google/callback",
  validateBodyMiddleware(z.object({ code: z.string() })),
  authController.generateSession,
);
router.get("/google/verify-token", authController.verifyToken);
router.post(
  "/google/refresh-token",
  validateBodyMiddleware(z.object({ refreshToken: z.string() })),
  authController.refreshToken,
);

export default router;
