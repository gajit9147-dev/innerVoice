import mysql from "mysql2/promise";
import env from "./env.js";
import { execSync } from "child_process";
import fs from "fs";

// Detect if we are running in WSL
const isWSL = process.platform === "linux" && 
  (fs.existsSync("/proc/sys/fs/binfmt_misc/WSLInterop") || 
   process.env.WSL_DISTRO_NAME !== undefined);

let dbHost = env.DB_HOST;

if (isWSL && (dbHost === "localhost" || dbHost === "127.0.0.1")) {
  try {
    const routeInfo = execSync("ip route", { encoding: "utf8" });
    const match = routeInfo.match(/default via (\S+)/);
    if (match && match[1]) {
      dbHost = match[1];
      console.log(`[WSL Database Connection] Dynamic DB_HOST resolved to Windows host IP: ${dbHost}`);
    }
  } catch (err) {
    console.warn(`[WSL Database Connection] Failed to resolve WSL gateway: ${err.message}. Using default DB_HOST: ${dbHost}`);
  }
}

const pool = mysql.createPool({
  host: dbHost,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

export default pool;