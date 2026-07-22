import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  console.log(`✅ Auth Middleware Executed for ${req.method} ${req.originalUrl}`);

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("🔑 Decoded Token:", decoded);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

export default authMiddleware;