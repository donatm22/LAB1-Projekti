const bcrypt = require("bcryptjs");
const db = require("../../database/db");
const { sanitizeUser } = require("./authController");

const isAdmin = (req) => req.user?.roli === "admin";

const canAccessUser = (req, userId) => isAdmin(req) || Number(req.user?.id) === Number(userId);

const getUsers = (req, res) => {
  db.query("SELECT id, emri, email, roli FROM Users ORDER BY id ASC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results.rows);
  });
};

const getUserById = (req, res) => {
  const { id } = req.params;

  if (!canAccessUser(req, id)) {
    return res.status(403).json({ message: "Access denied" });
  }

  db.query("SELECT id, emri, email, roli FROM Users WHERE id = $1", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.rows.length === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    res.json(results.rows[0]);
  });
};

const createUser = (req, res) => {
  const { emri, email, password, roli } = req.body;

  if (!emri || !email || !password || !roli) {
    return res.status(400).json({ message: "Ploteso emri, email, password dhe roli" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql =
    "INSERT INTO Users (emri, email, password, roli) VALUES ($1, $2, $3, $4) RETURNING id, emri, email, roli";
  const values = [emri, email, hashedPassword, roli];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === "23505") {
        return res.status(409).json({ message: "Email already exists" });
      }

      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "User u shtua me sukses",
      user: result.rows[0]
    });
  });
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

  db.query("SELECT * FROM Users WHERE id = $1", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    const existingUser = result.rows[0];
    const nextRole = isAdmin(req) && roli ? roli : existingUser.roli;
    const nextPassword = password ? bcrypt.hashSync(password, 10) : existingUser.password;

    db.query(
      "UPDATE Users SET emri = $1, email = $2, password = $3, roli = $4 WHERE id = $5 RETURNING id, emri, email, roli",
      [emri, email, nextPassword, nextRole, id],
      (updateErr, updateResult) => {
        if (updateErr) {
          if (updateErr.code === "23505") {
            return res.status(409).json({ message: "Email already exists" });
          }

          return res.status(500).json({ error: updateErr.message });
        }

        return res.json({
          message: "User u perditesua me sukses",
          user: sanitizeUser(updateResult.rows[0])
        });
      }
    );
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM Users WHERE id = $1", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    res.json({ message: "User u fshi me sukses" });
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
