const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcryptjs");
const { getUserByEmail, getUserById } = require("../../database/usersStore");

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    (email, password, done) => {
      getUserByEmail(email)
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isHashedPassword =
            typeof user.password === "string" && user.password.startsWith("$2");
          const isMatch = isHashedPassword
            ? bcrypt.compareSync(password, user.password)
            : password === user.password;

          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        })
        .catch((err) => done(err));
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  getUserById(id)
    .then((user) => done(null, user || false))
    .catch((err) => done(err));
});

module.exports = passport;
