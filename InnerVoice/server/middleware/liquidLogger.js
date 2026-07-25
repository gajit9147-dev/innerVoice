// ============================================================
// liquidLogger.js
// Morgan-style request logger that prints each request with an
// iridescent rainbow prefix using chalk.
// Usage: import liquidLogger from "./middleware/liquidLogger.js";
//        app.use(liquidLogger);
// ============================================================

import chalk from "chalk";

// Iridescent color cycle — each request cycles through these colors
const IRIDESCENT_COLORS = [
  chalk.hex("#c084fc"),  // purple
  chalk.hex("#818cf8"),  // indigo
  chalk.hex("#22d3ee"),  // cyan
  chalk.hex("#34d399"),  // emerald
  chalk.hex("#facc15"),  // yellow
  chalk.hex("#fb923c"),  // orange
  chalk.hex("#f472b6"),  // pink
  chalk.hex("#e879f9"),  // fuchsia
];

let colorIndex = 0;

// Method color map — makes the HTTP method stand out
const METHOD_COLORS = {
  GET:    chalk.bold.hex("#22d3ee"),
  POST:   chalk.bold.hex("#34d399"),
  PUT:    chalk.bold.hex("#facc15"),
  PATCH:  chalk.bold.hex("#fb923c"),
  DELETE: chalk.bold.hex("#f87171"),
};

// Status code coloring
const statusColor = (code) => {
  if (code >= 500) return chalk.bold.red(code);
  if (code >= 400) return chalk.bold.yellow(code);
  if (code >= 300) return chalk.bold.cyan(code);
  return chalk.bold.green(code);
};

// The actual Express middleware function
const liquidLogger = (req, res, next) => {
  const startTime = Date.now();

  // Pick the next iridescent color for the prefix gem
  const gem = IRIDESCENT_COLORS[colorIndex % IRIDESCENT_COLORS.length]("◆");
  colorIndex++;

  // After response is sent, log the full line
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const method   = METHOD_COLORS[req.method] || chalk.white(req.method);
    const status   = statusColor(res.statusCode);
    const url      = chalk.white(req.originalUrl);
    const ms       = chalk.hex("#94a3b8")(`${duration}ms`);
    const ts       = chalk.hex("#475569")(new Date().toLocaleTimeString());

    console.log(`${gem} ${ts}  ${method} ${url}  ${status}  ${ms}`);
  });

  next();
};

export default liquidLogger;
