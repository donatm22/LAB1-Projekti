const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root123",
    database: "event_management"
});

db.connect(err => {
    if (err) throw err;
    console.log("Databaza u lidh");
})

app.get("/", (req, res) => {
    res.send("API Funksionon");
});

app.listen(5000, () => {
    console.log("Serveri funksionon ne portin 5000");
});

app.get("/test-db", (req, res) => {
  db.query("SHOW TABLES", (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(result);
  });
});