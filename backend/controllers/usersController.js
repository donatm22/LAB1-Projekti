const bcrypt = require("bcryptjs");
const db = require("../../database/db");

const getUsers = (req, res) => {
  db.query("SELECT * FROM Users ORDER BY id ASC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results.rows);
  });
};

const getUserById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM Users WHERE id = $1", [id], (err, results) => {
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

  if (!emri || !email || !password || !roli) {
    return res.status(400).json({ message: "Ploteso emri, email, password dhe roli" });
  }

  const sql = "UPDATE Users SET emri = $1, email = $2, password = $3, roli = $4 WHERE id = $5";
  const values = [emri, email, password, roli, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    res.json({ message: "User u perditesua me sukses" });
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
