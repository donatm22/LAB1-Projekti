const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcryptjs");
const db = require("../../database/db");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    (email, password, done) => {
      db.query("SELECT * FROM Users WHERE email = $1", [email], (err, result) => {
        if (err) {
          return done(err);
        }

        const user = result.rows[0];

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isHashedPassword = typeof user.password === "string" && user.password.startsWith("$2");
        const isMatch = isHashedPassword
          ? bcrypt.compareSync(password, user.password)
          : password === user.password;

        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM Users WHERE id = $1", [id], (err, result) => {
    if (err) {
      return done(err);
    }

    done(null, result.rows[0] || false);
  });
});

module.exports = passport;
