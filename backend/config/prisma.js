const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

require("./env");

function buildDatabaseUrl() {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_DATABASE;

  if (!host || !port || !user || !password || !database) {
    return null;
  }

  const url = new URL(
    `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`
  );

  if (String(process.env.DB_SSL).toLowerCase() === "true") {
    url.searchParams.set("sslmode", "require");
  }

  return url.toString();
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  buildDatabaseUrl();

if (!databaseUrl) {
  throw new Error("DATABASE_URL or DB_* env vars are required for Prisma");
}

process.env.DATABASE_URL = databaseUrl;
process.env.DIRECT_URL = databaseUrl;

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl:
    String(process.env.DB_SSL).toLowerCase() === "true"
      ? { rejectUnauthorized: false }
      : false,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
