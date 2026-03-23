const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("../database/db");
const usersRoutes = require("./routes/users");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API Funksionon");
});

app.get("/test-db", (req, res) => {
  db.query("SELECT 1 AS status", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

app.get("/tabela", (req, res) => {
  db.query("SHOW TABLES", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.use("/users", usersRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

app.listen(5000, () => {
    console.log("Serveri funksionon ne portin 5000");
});
