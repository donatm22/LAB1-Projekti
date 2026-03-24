const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "backend", ".env") });
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "postgres",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  max: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined
});

pool.query("SELECT 1")
  .then(() => {
    console.log("DB pool connected");
  })
  .catch((err) => {
    console.error("DB pool connection error:", err.message);
  });

module.exports = pool;
