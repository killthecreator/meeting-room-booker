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
router.get("/google/logout", authController.logout);

export default router;
