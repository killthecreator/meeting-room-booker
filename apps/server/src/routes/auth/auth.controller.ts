import type { RequestHandler } from "express";

import { googleAuthSchema } from "@meeting-calendar/shared";
import { getAuthToken } from "../../utils/getAuthToken";
import { SESSION_COOKIE_KEY } from "../../constants";
import { oAuth2Client } from "../../oauthClient";
import { verifyAuthToken } from "../../utils/verifyAuthToken";
import { ENV } from "../../env";

export const authController = {
  async generateSession(req, res) {
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens

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

    const ticket = await verifyAuthToken(req);
    const payload = ticket.getPayload();

    res.json(googleAuthSchema.parse(payload));
  },
} satisfies Record<string, RequestHandler>;
