const express = require("express");
const passport = require("passport");
const { login } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  login
);

module.exports = router;
