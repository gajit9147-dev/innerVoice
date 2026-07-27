import app from "./app.js";
import env from "./config/env.js";
import logger from "./utils/logger.js";

const PORT = env.PORT || 5000;

// Server start listener
const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    logger.error(`❌ Port ${PORT} is already in use. Please close the other process and restart.`);
    process.exit(1);
  } else {
    logger.error("❌ Server Error: " + (err.stack || err.message));
  }
});

server.on("listening", () => {
  logger.info("✅ Express is actually listening");
});
