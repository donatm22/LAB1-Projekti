const fs = require("fs");
const path = require("path");

const migrationsDir = path.join(__dirname, "..", "migrations");
const rawName = process.argv.slice(2).join(" ").trim();

if (!rawName) {
  console.error("Usage: npm run migration:create -- add_users_table");
  process.exit(1);
}

const slug = rawName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

if (!slug) {
  console.error("Migration name must contain letters or numbers.");
  process.exit(1);
}

const now = new Date();
const timestamp = [
  now.getUTCFullYear(),
  String(now.getUTCMonth() + 1).padStart(2, "0"),
  String(now.getUTCDate()).padStart(2, "0"),
  String(now.getUTCHours()).padStart(2, "0"),
  String(now.getUTCMinutes()).padStart(2, "0"),
  String(now.getUTCSeconds()).padStart(2, "0")
].join("");

const filename = `${timestamp}_${slug}.sql`;
const filePath = path.join(migrationsDir, filename);
const template = `-- Migration: ${slug}
-- Write forward-only SQL here.

-- Example:
-- CREATE TABLE IF NOT EXISTS example_table (
--   id SERIAL PRIMARY KEY,
--   name TEXT NOT NULL
-- );
`;

fs.mkdirSync(migrationsDir, { recursive: true });
fs.writeFileSync(filePath, template, "utf8");

console.log(`Created migration: ${filePath}`);
