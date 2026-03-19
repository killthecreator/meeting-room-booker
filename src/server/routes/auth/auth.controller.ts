import type { RequestHandler } from "express";
import { signSession, unsignSession } from "./utils/session";
import { getRedirectUri } from "./utils/getRedirectUri";
import crypto from "crypto";
import { decodeJwtPayload } from "./utils/decodeJwtPayload";
import { googleAuthSchema } from "../../../schemas/authUser";
import { CONFIG } from "../../config";
import { getAuthToken } from "./utils/getAuthToken";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  ALLOWED_GOOGLE_DOMAIN,
  FRONTEND_ORIGIN,
  GOOGLE_TOKEN,
  GOOGLE_AUTHORIZE,
} = CONFIG;

const stateStore = new Map<string, { createdAt: number }>();

export const authController = {
  async setSession(req, res) {
    const code = req.query.code as string | undefined;
    const state = req.query.state as string | undefined;
    const error = req.query.error as string | undefined;

    if (error) {
      return res.redirect(
        FRONTEND_ORIGIN + "?error=" + encodeURIComponent(error),
      );
    }
    if (!state || !stateStore.has(state)) {
      return res.redirect(FRONTEND_ORIGIN + "?error=invalid_state");
    }
    stateStore.delete(state);
    if (!code) {
      return res.redirect(FRONTEND_ORIGIN + "?error=no_code");
    }

    const redirectUri = getRedirectUri(req);
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
    });

    const tokenRes = await fetch(GOOGLE_TOKEN, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }).catch(() => null);

    if (!tokenRes || !tokenRes.ok) {
      return res.redirect(FRONTEND_ORIGIN + "?error=token_exchange_failed");
    }

    const data = (await tokenRes.json()) as { id_token?: string };
    if (!data.id_token) {
      return res.redirect(FRONTEND_ORIGIN + "?error=no_id_token");
    }

    const payload = decodeJwtPayload(data.id_token);
    if (!payload) {
      return res.redirect(FRONTEND_ORIGIN + "?error=invalid_token");
    }

    const domain = payload.hd as string | undefined;
    if (
      ALLOWED_GOOGLE_DOMAIN &&
      (!domain || domain.toLowerCase() !== ALLOWED_GOOGLE_DOMAIN.toLowerCase())
    ) {
      return res.redirect(FRONTEND_ORIGIN + "?error=domain_not_allowed");
    }

    const user = googleAuthSchema.parse(payload);

    const sessionToken = signSession(user);
    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    const origin = new URL(FRONTEND_ORIGIN);
    const sameOrigin = req.get("host") === origin.host;
    if (sameOrigin) {
      res.redirect(FRONTEND_ORIGIN);
    } else {
      res.redirect(
        FRONTEND_ORIGIN + "#session=" + encodeURIComponent(sessionToken),
      );
    }
  },
  redirectToGoogleSignIn(req, res) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return res.status(500).send("Google auth not configured (missing env).");
    }
    const redirectUri = getRedirectUri(req);
    if (!redirectUri.startsWith("http")) {
      return res
        .status(500)
        .send(
          "Google redirect URI not configured. Set GOOGLE_REDIRECT_URI in .env",
        );
    }
    const state = crypto.randomBytes(16).toString("hex");
    stateStore.set(state, { createdAt: Date.now() });
    const params = new URLSearchParams({
      response_type: "code",
      scope: "openid email profile",
      client_id: GOOGLE_CLIENT_ID,
      state,
      redirect_uri: redirectUri,
    });
    if (ALLOWED_GOOGLE_DOMAIN) {
      params.set("hd", ALLOWED_GOOGLE_DOMAIN);
    }
    res.redirect(`${GOOGLE_AUTHORIZE}?${params.toString()}`);
  },
  getMe(req, res) {
    const token = getAuthToken(req);
    if (!token) {
      return res.status(401).json({ error: "Not signed in" });
    }
    const user = unsignSession(token);
    if (!user) {
      res.clearCookie("session", { path: "/" });
      return res.status(401).json({ error: "Invalid session" });
    }
    res.json(user);
  },

  logout(_req, res) {
    res.clearCookie("session", { path: "/" });
    res.json({ ok: true });
  },
} satisfies Record<string, RequestHandler>;
