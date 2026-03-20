const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
    res.send("API Funksionon");
});

app.listen(5000, () => {
    console.log("Serveri funksionon ne portin 5000");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});