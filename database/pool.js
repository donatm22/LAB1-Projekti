const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Pool } = require("pg");

const usesSsl =
  process.env.DB_SSL === "true" ||
  Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL);

const poolConfig = {
  max: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
  ssl: usesSsl ? { rejectUnauthorized: false } : undefined,
};

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (connectionString) {
  poolConfig.connectionString = connectionString;
} else {
  poolConfig.host = process.env.DB_HOST || "localhost";
  poolConfig.user = process.env.DB_USER || "postgres";
  poolConfig.password = process.env.DB_PASSWORD || "postgres";
  poolConfig.database = process.env.DB_DATABASE || "lab1";
  poolConfig.port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
}

const pool = new Pool(poolConfig);

pool.query("SELECT 1")
  .then(() => {
    console.log("DB pool connected");
  })
  .catch((err) => {
    console.error("DB pool connection error:", err.message);
  });

module.exports = pool;
