import { Router } from "express";
import z from "zod";

import { authController } from "./auth.controller";
import { validateBodyMiddleware } from "../../middlewares/validateBody";

const router = Router();

router.get("/google/callback", authController.generateSession);
router.get("/google/verify-token", authController.verifyToken);
router.post(
  "/google/refresh-token",
  validateBodyMiddleware(z.object({ refreshToken: z.string() })),
  authController.refreshToken,
);
router.get("/google/logout", authController.logout);

export default router;
