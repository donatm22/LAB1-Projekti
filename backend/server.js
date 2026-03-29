const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");
const db = require("../database/db");
const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const eventCategoriesRoutes = require("./routes/eventCategoriesRoutes");
const eventRoutes = require("./routes/eventRoutes");
const speakerRoutes = require("./routes/speakerRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const sponsorRoutes = require("./routes/sponsorRoutes");
require("./config/passport");

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get("/", (req, res) => {
    res.send("API Funksionon");
});

app.get("/test-db", (req, res) => {
  db.query("SELECT 1 AS status", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results.rows);
  });
});

app.get("/tabela", (req, res) => {
  db.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results.rows);
    }
  );
});

app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use("/eventCategories", eventCategoriesRoutes);
app.use("/speaker", speakerRoutes);
app.use("/event", eventRoutes);
app.use("/ticket", ticketRoutes);
app.use("/sponsor", sponsorRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveri funksionon ne portin ${PORT}`);
});
