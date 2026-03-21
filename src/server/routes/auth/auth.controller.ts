import type { RequestHandler } from "express";

import { ENV } from "../../env";
import { UserRefreshClient } from "google-auth-library";
import { getAuthToken } from "./../../utils/getAuthToken";
import { googleAuthSchema } from "../../../schemas/authUser";
import { SESSION_COOKIE_KEY } from "../../../constants";
import { oAuth2Client } from "../../oauthClient";
import { verifyAuthToken } from "../../utils/verifyAuthToken";
import z from "zod";

export const authController = {
  async generateSession(req, res) {
    const code = z.string().parse(req.query.code);
    const { tokens } = await oAuth2Client.getToken(code); // exchange code for tokens

    res.cookie(SESSION_COOKIE_KEY, tokens.id_token, {
      expires: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    });

    res.send();
  },

  async logout(_req, res) {
    res.clearCookie(SESSION_COOKIE_KEY);
    res.send();
  },

  async verifyToken(req, res) {
    const authToken = getAuthToken(req);
    if (!authToken) return res.status(200).send();

    const ticket = await verifyAuthToken(req);
    const payload = ticket.getPayload();

    res.json(googleAuthSchema.parse(payload));
  },

  async refreshToken(req, res) {
    const user = new UserRefreshClient(
      ENV.GOOGLE_CLIENT_ID,
      ENV.GOOGLE_CLIENT_SECRET,
      req.body.refreshToken,
    );
    const { credentials } = await user.refreshAccessToken(); // obtain new tokens
    res.json(credentials);
  },
} satisfies Record<string, RequestHandler<never>>;
