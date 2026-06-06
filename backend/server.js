process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

process.on("exit", (code) => {
  console.log("PROCESS EXITED WITH CODE:", code);
});


BigInt.prototype.toJSON = function () {
  return this.toString();
};

const express = require("express");
const cors = require("cors");
const path = require("path");
require("./config/env");
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
const chatRoutes = require("./routes/chatRoutes");
const emailRoutes = require("./routes/emailRoutes");
const { initializeReminderCron } = require("./cron/reminderCron");

require("./config/passport");


const app = express();

const allowedOrigins = new Set(
  [
    ...(String(process.env.CORS_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)),
    ...(String(process.env.APP_URL || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)),
    "http://localhost:5173",
    "http://localhost:5174",
  ]
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      const error = new Error(`CORS blocked for origin: ${origin}`);
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(passport.initialize());

app.get("/", (req, res) => {
    res.send("API Funksionon");
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
app.use("/chat", chatRoutes);
app.use("/email", emailRoutes);

// Initialize reminder cron job
initializeReminderCron();

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Server error";
  res.status(statusCode).json({ message, code: err.code });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Serveri funksionon ne portin ${PORT}`);
    console.log(process.env.JWT_SECRET ? "JWT_SECRET loaded" : "JWT_SECRET missing");
});
