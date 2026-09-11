// ============================================================
// server/services/googleAuth.service.js
// Official Google ID Token verification using google-auth-library
// ============================================================

import { OAuth2Client } from "google-auth-library";
import logger from "../utils/logger.js";

let oauth2Client = null;

const getOAuthClient = () => {
  const rawId =
    process.env.GOOGLE_CLIENT_ID ||
    "104942402554-buppqtd0bio5um986ibvq2sq669raf85.apps.googleusercontent.com";
  const clientId = rawId.trim();

  if (!oauth2Client) {
    oauth2Client = new OAuth2Client(clientId);
  }

  return { client: oauth2Client, clientId };
};

/**
 * Verify Google ID token received from Google Identity Services
 * @param {string} idToken - Raw JWT string from Google
 * @returns {Promise<{sub: string, email: string, name: string, picture: string, email_verified: boolean}>}
 */
export const verifyGoogleIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing Google ID token.");
  }

  const { client, clientId } = getOAuthClient();

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Invalid Google token payload.");
    }

    // Verify issuer is Google
    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!validIssuers.includes(payload.iss)) {
      throw new Error(`Invalid token issuer: ${payload.iss}`);
    }

    if (!payload.sub) {
      throw new Error("Missing Google user identifier (sub).");
    }

    if (!payload.email) {
      throw new Error("Google account did not provide a verified email address.");
    }

    logger.info(`Google token verified for sub=${payload.sub}, email=${payload.email}`);

    return {
      sub: payload.sub,
      email: payload.email.trim().toLowerCase(),
      name: payload.name || payload.given_name || payload.email.split("@")[0],
      picture: payload.picture || null,
      email_verified: Boolean(payload.email_verified),
    };
  } catch (error) {
    logger.error("Google Token Verification Failed: " + error.message);
    throw new Error(`Google authentication failed: ${error.message}`);
  }
};
