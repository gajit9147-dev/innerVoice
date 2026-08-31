import pg from "pg";
import env from "./env.js";

const { Pool } = pg;

// PostgreSQL connection pool
const pgPool = new Pool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: Number(env.DB_PORT || 5432),
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Convert MySQL-style ? placeholders to PostgreSQL $1, $2, $3...
const convertPlaceholders = (sql) => {
  let index = 0;

  return sql.replace(/\?/g, () => {
    index++;
    return `$${index}`;
  });
};

const BOOLEAN_COLUMNS = ["is_locked", "is_pinned", "is_favorite", "is_deleted"];

const normalizeBooleanParams = (sql, params) => {
  if (!Array.isArray(params) || params.length === 0) {
    return params;
  }

  const placeholders = [...sql.matchAll(/\?/g)];
  const normalized = [...params];

  for (let index = 0; index < normalized.length; index += 1) {
    const value = normalized[index];

    if (value !== 0 && value !== 1) {
      continue;
    }

    const placeholder = placeholders[index];
    if (!placeholder) {
      continue;
    }

    const placeholderIndex = placeholder.index;
    const contextStart = Math.max(0, placeholderIndex - 120);
    const contextEnd = Math.min(sql.length, placeholderIndex + 120);
    const context = sql.slice(contextStart, contextEnd).toLowerCase();

    const isBooleanAssignment = BOOLEAN_COLUMNS.some((column) => {
      const pattern = new RegExp(`\\b${column}\\b\\s*(?:=|\\)|,|\\s*\\?)`, "i");
      return pattern.test(context);
    });

    if (isBooleanAssignment) {
      normalized[index] = value === 0 ? false : true;
    }
  }

  return normalized;
};

// Compatibility wrapper so most existing controllers can continue using:
// const [rows] = await pool.query(...)
const pool = {
  async query(sql, params = []) {
    const trimmedSql = sql.trim();
    const normalizedSql = convertPlaceholders(trimmedSql);
    const normalizedParams = normalizeBooleanParams(trimmedSql, params);

    const isSelect = /^\s*(SELECT|SHOW|DESCRIBE|WITH)\b/i.test(normalizedSql);

    const isInsert = /^\s*INSERT\b/i.test(normalizedSql);

    const isUpdate = /^\s*UPDATE\b/i.test(normalizedSql);

    const isDelete = /^\s*DELETE\b/i.test(normalizedSql);

    let querySql = normalizedSql;

    // PostgreSQL needs RETURNING id for insertId compatibility
    if (isInsert && !/\bRETURNING\b/i.test(normalizedSql)) {
      querySql = `${normalizedSql.replace(/;$/, "")} RETURNING id`;
    }

    const result = await pgPool.query(querySql, normalizedParams);

    if (isSelect) {
      return [result.rows];
    }

    if (isInsert) {
      return [
        {
          insertId: result.rows[0]?.id ?? null,
          affectedRows: result.rowCount,
        },
      ];
    }

    if (isUpdate || isDelete) {
      return [
        {
          affectedRows: result.rowCount,
        },
      ];
    }

    return [result.rows];
  },

  async getConnection() {
    const client = await pgPool.connect();

    return {
      query: (...args) => client.query(...args),
      release: () => client.release(),
    };
  },

  async end() {
    await pgPool.end();
  },
};

export default pool;
