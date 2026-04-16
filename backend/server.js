const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const passport = require("passport");
const db = require("../database/db");
const usersRoutes = require("./routes/usersRoutes");
const authRoutes = require("./routes/authRoutes");
const eventCategoriesRoutes = require("./routes/eventCategoriesRoutes");
const eventRoutes = require("./routes/eventRoutes");
const eventSpeakersRoutes = require("./routes/eventSpeakersRoutes");
const eventSponsorRoutes = require("./routes/eventSponsorRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const eventSchedulesRoutes = require("./routes/eventSchedulesRoutes");
const organizerRoutes = require("./routes/organizerRoutes");
const speakerRoutes = require("./routes/speakerRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const ticketTypesRoutes = require("./routes/ticketTypesRoutes");
const sponsorRoutes = require("./routes/sponsorRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const paymentRoutes = require("./routes/paymentsRoutes");
const registrationRoutes = require("./routes/registrationRoutes")
const venueRoutes = require("./routes/venueRoutes");

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
app.use("/eventSpeakers", eventSpeakersRoutes);
app.use("/eventSponsor", eventSponsorRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/eventSchedules", eventSchedulesRoutes);
app.use("/organizers", organizerRoutes);
app.use("/ticket", ticketRoutes);
app.use("/ticketTypes", ticketTypesRoutes);
app.use("/sponsor", sponsorRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/payment", paymentRoutes);
app.use("/registrations", registrationRoutes);
app.use("/venues", venueRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveri funksionon ne portin ${PORT}`);
});
