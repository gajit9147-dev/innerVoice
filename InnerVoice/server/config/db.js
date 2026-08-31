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

// Compatibility wrapper so most existing controllers can continue using:
// const [rows] = await pool.query(...)
const pool = {
  async query(sql, params = []) {
    const normalizedSql = convertPlaceholders(sql.trim());

    const isSelect = /^\s*(SELECT|SHOW|DESCRIBE|WITH)\b/i.test(normalizedSql);

    const isInsert = /^\s*INSERT\b/i.test(normalizedSql);

    const isUpdate = /^\s*UPDATE\b/i.test(normalizedSql);

    const isDelete = /^\s*DELETE\b/i.test(normalizedSql);

    let querySql = normalizedSql;

    // PostgreSQL needs RETURNING id for insertId compatibility
    if (isInsert && !/\bRETURNING\b/i.test(normalizedSql)) {
      querySql = `${normalizedSql.replace(/;$/, "")} RETURNING id`;
    }

    const result = await pgPool.query(querySql, params);

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
