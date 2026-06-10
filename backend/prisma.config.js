const { defineConfig } = require('@prisma/config');
require('dotenv').config();

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

  if (String(process.env.DB_SSL).toLowerCase() === 'true') {
    url.searchParams.set('sslmode', 'require');
  }

  return url.toString();
}

const databaseUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  buildDatabaseUrl();

if (databaseUrl) {
  process.env.DIRECT_URL = databaseUrl;
  process.env.DATABASE_URL = databaseUrl;
}

module.exports = defineConfig({
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
