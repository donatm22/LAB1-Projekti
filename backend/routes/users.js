const express = require("express");
const db = require("../../database/db");

const router = express.Router();

router.get("/", (req, res) => {
  db.query("SELECT * FROM Users ORDER BY id ASC", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM Users WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    res.json(results[0]);
  });
});

router.post("/", (req, res) => {
  const { emri, email, password, roli } = req.body;

  if (!emri || !email || !password || !roli) {
    return res.status(400).json({ message: "Ploteso emri, email, password dhe roli" });
  }

  const sql = "INSERT INTO Users (emri, email, password, roli) VALUES (?, ?, ?, ?)";
  const values = [emri, email, password, roli];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({
      message: "User u shtua me sukses",
      id: result.insertId
    });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { emri, email, password, roli } = req.body;

  if (!emri || !email || !password || !roli) {
    return res.status(400).json({ message: "Ploteso emri, email, password dhe roli" });
  }

  const sql = "UPDATE Users SET emri = ?, email = ?, password = ?, roli = ? WHERE id = ?";
  const values = [emri, email, password, roli, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    res.json({ message: "User u perditesua me sukses" });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM Users WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    res.json({ message: "User u fshi me sukses" });
  });
});

module.exports = router;
