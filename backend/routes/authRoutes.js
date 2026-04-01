const express = require("express");
const passport = require("passport");
const verifyToken = require("../middleware/authMiddleware");
const { login, getCurrentSession, logout } = require("../controllers/authController");

const router = express.Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({
        message: info?.message || "Invalid email or password"
      });
    }

    req.user = user;
    return login(req, res);
  })(req, res, next);
});

router.get("/me", verifyToken, getCurrentSession);

router.post("/logout", verifyToken, logout);

module.exports = router;
