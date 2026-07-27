import { errorResponse } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";

export function notFound(req, res, _next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message);

  return errorResponse(
    res,
    err.message || "Internal Server Error",
    err.statusCode || 500
  );
}