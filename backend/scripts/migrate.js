const fs = require("fs");
const path = require("path");
const pool = require("../../database/pool");

const migrationsDir = path.join(__dirname, "..", "migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

function getMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));
}

async function run() {
  const client = await pool.connect();
  let appliedCount = 0;

  try {
    await ensureMigrationsTable(client);

    const { rows } = await client.query(
      "SELECT filename FROM schema_migrations ORDER BY filename ASC"
    );
    const appliedMigrations = new Set(rows.map((row) => row.filename));
    const migrationFiles = getMigrationFiles();
    const pendingMigrations = migrationFiles.filter(
      (file) => !appliedMigrations.has(file)
    );

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    for (const file of pendingMigrations) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8").trim();

      if (!sql) {
        console.log(`Skipping empty migration: ${file}`);
        continue;
      }

      console.log(`Running migration: ${file}`);

      await client.query("BEGIN");

      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        appliedCount += 1;
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Migration failed for ${file}: ${error.message}`);
      }
    }

    console.log(`Applied ${appliedCount} migration(s).`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
