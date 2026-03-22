import type { RequestHandler } from "express";

import { googleAuthSchema } from "@meeting-calendar/shared";
import { getAuthToken } from "../../utils/getAuthToken";
import { SESSION_COOKIE_KEY } from "../../constants";
import { ENV } from "../../env";
import { authService } from "./auth.service";

export const authController = {
  async generateSession(req, res) {
    const { tokens } = await authService.getToken(req.body.code);

    res.cookie(SESSION_COOKIE_KEY, tokens.id_token, {
      expires: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
    });

    res.send();
  },

  async logout(_req, res) {
    res.clearCookie(SESSION_COOKIE_KEY, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
    });
    res.send();
  },

  async verifyToken(req, res) {
    const authToken = getAuthToken(req);
    if (!authToken) return res.status(200).send();

    const ticket = await authService.verifyToken(authToken);

    const payload = ticket.getPayload();

    res.json(googleAuthSchema.parse(payload));
  },
} satisfies Record<string, RequestHandler>;
