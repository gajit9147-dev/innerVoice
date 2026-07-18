import jwt from "jsonwebtoken";

export function generateToken(payload) {
  const secret = process.env.JWT_SECRET || "change-me";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}