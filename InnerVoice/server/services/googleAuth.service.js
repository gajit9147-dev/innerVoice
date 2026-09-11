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
 * Verify Google authentication token (supports both ID token JWT and OAuth2 access token)
 * @param {string} token - Raw JWT string or OAuth2 access token from Google
 * @param {object} [rawUserInfo] - Optional client-supplied profile for fast resolution
 * @returns {Promise<{sub: string, email: string, name: string, picture: string, email_verified: boolean}>}
 */
export const verifyGoogleIdToken = async (token, rawUserInfo = null) => {
  if (!token || typeof token !== "string") {
    throw new Error("Missing Google authentication token.");
  }

  const { client, clientId } = getOAuthClient();
  const cleanToken = token.trim();

  // Check if token is a 3-part JWT (OIDC ID Token)
  const isJwt = cleanToken.split(".").length === 3;

  if (isJwt) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: cleanToken,
        audience: clientId,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error("Invalid Google token payload.");
      }

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

      logger.info(`Google ID token verified for sub=${payload.sub}, email=${payload.email}`);

      return {
        sub: payload.sub,
        email: payload.email.trim().toLowerCase(),
        name: payload.name || payload.given_name || payload.email.split("@")[0],
        picture: payload.picture || null,
        email_verified: Boolean(payload.email_verified),
      };
    } catch (jwtError) {
      // If it failed audience or parsing check, log warning and try access token verification
      logger.warn(`Google JWT verification failed (${jwtError.message}), attempting tokeninfo inspection...`);
    }
  }

  // Fallback: Verify OAuth2 Access Token via Google's tokeninfo & userinfo APIs
  try {
    const tokenInfo = await client.getTokenInfo(cleanToken);

    // Fetch user profile from Google's userinfo endpoint
    let profile = null;
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      if (res.ok) {
        profile = await res.json();
      }
    } catch (profileErr) {
      logger.warn(`Failed to fetch userinfo from Google API: ${profileErr.message}`);
    }

    const email = (tokenInfo.email || profile?.email || rawUserInfo?.email || "").trim().toLowerCase();
    const sub = tokenInfo.sub || tokenInfo.user_id || profile?.sub || rawUserInfo?.sub;

    if (!email) {
      throw new Error("Google account did not provide a verified email address.");
    }

    if (!sub) {
      throw new Error("Missing Google user identifier (sub).");
    }

    const name = profile?.name || rawUserInfo?.name || email.split("@")[0];
    const picture = profile?.picture || rawUserInfo?.picture || null;
    const isEmailVerified = Boolean(
      tokenInfo.email_verified === "true" ||
      tokenInfo.email_verified === true ||
      profile?.email_verified
    );

    logger.info(`Google access token verified for sub=${sub}, email=${email}`);

    return {
      sub,
      email,
      name,
      picture,
      email_verified: isEmailVerified,
    };
  } catch (error) {
    logger.error("Google Token Verification Failed: " + error.message);
    throw new Error(`Google authentication failed: ${error.message}`);
  }
};
