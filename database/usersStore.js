const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const DB_FILE = path.join(__dirname, "users.sqlite");

let sqlPromise = null;
let db = null;

const getSql = async () => {
  if (!sqlPromise) {
    sqlPromise = initSqlJs({
      locateFile: (file) => require.resolve(`sql.js/dist/${file}`)
    });
  }

  return sqlPromise;
};

const persist = () => {
  if (!db) {
    return;
  }

  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
};

const ensureSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emri TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      roli TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  persist();
};

const getDb = async () => {
  if (db) {
    return db;
  }

  const SQL = await getSql();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  ensureSchema();
  return db;
};

const execQuery = async (sql, params = []) => {
  const database = await getDb();
  const statement = database.prepare(sql);
  statement.bind(params);

  const isSelect = /^\s*select/i.test(sql);
  const isReturning = /\breturning\b/i.test(sql);
  const rows = [];

  try {
    while (statement.step()) {
      rows.push(statement.getAsObject());
    }
  } finally {
    statement.free();
  }

  if (isSelect || isReturning) {
    return { rows, rowCount: rows.length };
  }

  persist();
  return { rows: [], rowCount: database.getRowsModified() };
};

const listUsers = async () => {
  const result = await execQuery(
    'SELECT id, emri, email, roli, created_at FROM Users ORDER BY id ASC'
  );
  return result.rows;
};

const getUserByEmail = async (email) => {
  const result = await execQuery(
    'SELECT * FROM Users WHERE email = ? LIMIT 1',
    [email]
  );
  return result.rows[0] || null;
};

const getUserById = async (id) => {
  const result = await execQuery(
    'SELECT * FROM Users WHERE id = ? LIMIT 1',
    [id]
  );
  return result.rows[0] || null;
};

const createUser = async ({ emri, email, password, roli }) => {
  const database = await getDb();

  try {
    database.run(
      "INSERT INTO Users (emri, email, password, roli) VALUES (?, ?, ?, ?)",
      [emri, email, password, roli]
    );
    persist();
  } catch (error) {
    if (String(error.message || "").includes("UNIQUE")) {
      const duplicate = new Error("Email already exists");
      duplicate.code = "23505";
      throw duplicate;
    }

    throw error;
  }

  const created = await execQuery(
    'SELECT id, emri, email, roli, created_at FROM Users WHERE email = ? LIMIT 1',
    [email]
  );

  return created.rows[0] || null;
};

const updateUser = async (id, { emri, email, password, roli }) => {
  const database = await getDb();
  const existing = await getUserById(id);

  if (!existing) {
    return null;
  }

  const nextPassword = password || existing.password;
  const nextRole = roli || existing.roli;

  try {
    database.run(
      "UPDATE Users SET emri = ?, email = ?, password = ?, roli = ? WHERE id = ?",
      [emri, email, nextPassword, nextRole, id]
    );
    persist();
  } catch (error) {
    if (String(error.message || "").includes("UNIQUE")) {
      const duplicate = new Error("Email already exists");
      duplicate.code = "23505";
      throw duplicate;
    }

    throw error;
  }

  const updated = await getUserById(id);
  return updated;
};

const deleteUser = async (id) => {
  const database = await getDb();
  const existing = await getUserById(id);

  if (!existing) {
    return false;
  }

  database.run("DELETE FROM Users WHERE id = ?", [id]);
  persist();
  return true;
};

module.exports = {
  createUser,
  deleteUser,
  execQuery,
  getUserByEmail,
  getUserById,
  listUsers,
  updateUser
};
