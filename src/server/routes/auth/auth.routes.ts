import { Router } from "express";

import { authController } from "./auth.controller";

const router = Router();

/** GET /api/auth/google — redirect to Google Sign-in */
router.get("/google", authController.redirectToGoogleSignIn);
/** GET /api/auth/google/calback — exchange code, check domain, set session */
router.get("/google/callback", authController.setSession);
router.get("/me", authController.getMe);
router.post("/logout", authController.logout);

export default router;
