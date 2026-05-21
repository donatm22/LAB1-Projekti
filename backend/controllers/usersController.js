const bcrypt = require("bcryptjs");
const db = require("../../database/db");
const { sanitizeUser } = require("./authController");
const { revokeUserRefreshSessions } = require("../services/sessionService");

const isAdmin = (req) => req.user?.roli === "admin";
const canAccessUser = (req, userId) => isAdmin(req) || String(req.user?.id) === String(userId);

const getUsers = (req, res) => {
  db.query(
    'SELECT id, emri, email, roli, created_at FROM "Users" ORDER BY id ASC',
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      return res.json(result.rows);
    }
  );
};

const getUserById = (req, res) => {
  const { id } = req.params;

  if (!canAccessUser(req, id)) {
    return res.status(403).json({ message: "Access denied" });
  }

  db.query(
    'SELECT id, emri, email, roli, created_at FROM "Users" WHERE id = $1 LIMIT 1',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User nuk u gjet" });
      }

      return res.json(result.rows[0]);
    }
  );
};

const createUser = (req, res) => {
  const { emri, email, password, roli } = req.body;

  if (!emri || !email || !password || !roli) {
    return res.status(400).json({ message: "Ploteso emri, email, password dhe roli" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO "Users" (emri, email, password, roli) VALUES ($1, $2, $3, $4) RETURNING id, emri, email, roli, created_at',
    [emri, email, hashedPassword, roli],
    (err, result) => {
      if (err) {
        if (err.code === "23505") {
          return res.status(409).json({ message: "Email already exists" });
        }

        return res.status(500).json({ error: err.message });
      }

      return res.status(201).json({
        message: "Registration successful. Your account has been saved.",
        user: result.rows[0],
      });
    }
  );
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { emri, email, password, roli } = req.body;

  if (!canAccessUser(req, id)) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!emri || !email) {
    return res.status(400).json({ message: "Ploteso emri dhe email" });
  }

  db.query('SELECT * FROM "Users" WHERE id = $1 LIMIT 1', [id], (findErr, findResult) => {
    if (findErr) {
      return res.status(500).json({ error: findErr.message });
    }

    if (findResult.rows.length === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    const existingUser = findResult.rows[0];
    const nextRole = isAdmin(req) && roli ? roli : existingUser.roli;
    const nextPassword = password ? bcrypt.hashSync(password, 10) : existingUser.password;

    db.query(
      'UPDATE "Users" SET emri = $1, email = $2, password = $3, roli = $4 WHERE id = $5 RETURNING *',
      [emri, email, nextPassword, nextRole, id],
      async (updateErr, updateResult) => {
        if (updateErr) {
          if (updateErr.code === "23505") {
            return res.status(409).json({ message: "Email already exists" });
          }

          return res.status(500).json({ error: updateErr.message });
        }

        try {
          if (password) {
            await revokeUserRefreshSessions(id);
          }
        } catch (sessionError) {
          console.error("Failed to revoke user refresh sessions:", sessionError.message);
        }

        return res.json({
          message: "User u perditesua me sukses",
          user: sanitizeUser(updateResult.rows[0]),
        });
      }
    );
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  const isOrganizer = req.user?.roli === "organizer";

  // Only admins can delete users
  if (isOrganizer) {
    return res.status(403).json({
      message: "Access denied. Only admins can delete users."
    });
  }

  db.query('DELETE FROM "Users" WHERE id = $1', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    return res.json({ message: "User u fshi me sukses" });
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
