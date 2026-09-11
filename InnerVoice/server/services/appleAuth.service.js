// ============================================================
// server/services/appleAuth.service.js
// Production Sign in with Apple verification using Apple's official JWKS
// ============================================================

import { createPublicKey } from "crypto";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

let appleKeysCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch and cache Apple's official public keys
 */
const getApplePublicKeys = async () => {
  const now = Date.now();
  if (appleKeysCache && now - lastFetchTime < CACHE_TTL_MS) {
    return appleKeysCache;
  }

  try {
    const response = await fetch("https://appleid.apple.com/auth/keys", {
      headers: { "User-Agent": "InnerVoice-App" },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Apple public keys: HTTP ${response.status}`);
    }

    const data = await response.json();
    appleKeysCache = data.keys;
    lastFetchTime = now;
    return appleKeysCache;
  } catch (error) {
    logger.error("Failed to fetch Apple public keys: " + error.message);
    if (appleKeysCache) return appleKeysCache; // Fallback to stale cache if available
    throw error;
  }
};

/**
 * Verify Apple Identity Token (JWT)
 * @param {string} idToken - Apple identity token
 * @returns {Promise<{sub: string, email: string, email_verified: boolean, is_private_email: boolean}>}
 */
export const verifyAppleIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing Apple identity token.");
  }

  const clientId = process.env.APPLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "APPLE_CLIENT_ID is not configured on the server. Please set APPLE_CLIENT_ID in server/.env"
    );
  }

  // 1. Decode token header to find the Key ID (kid)
  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    throw new Error("Invalid Apple token format or missing 'kid' in header.");
  }

  const { kid, alg } = decodedHeader.header;
  if (alg !== "RS256") {
    throw new Error(`Unexpected signing algorithm from Apple token: ${alg}`);
  }

  // 2. Fetch Apple JWKS and match key
  const keys = await getApplePublicKeys();
  const matchingKey = keys.find((k) => k.kid === kid);

  if (!matchingKey) {
    throw new Error(`Apple public key with kid '${kid}' not found in Apple JWKS.`);
  }

  // 3. Convert JWK to native KeyObject
  const publicKey = createPublicKey({
    key: matchingKey,
    format: "jwk",
  });

  // 4. Verify token signature, issuer, audience, expiration
  try {
    const payload = jwt.verify(idToken, publicKey, {
      algorithms: ["RS256"],
      issuer: "https://appleid.apple.com",
      audience: clientId,
    });

    if (!payload.sub) {
      throw new Error("Missing Apple user identifier (sub).");
    }

    const emailVerified =
      payload.email_verified === true ||
      payload.email_verified === "true" ||
      payload.email_verified === "1";

    logger.info(`Apple identity token verified for sub=${payload.sub}`);

    return {
      sub: payload.sub,
      email: payload.email ? payload.email.trim().toLowerCase() : null,
      email_verified: emailVerified,
      is_private_email: Boolean(payload.is_private_email),
    };
  } catch (err) {
    logger.error("Apple Token Verification Failed: " + err.message);
    throw new Error(`Apple authentication failed: ${err.message}`);
  }
};
