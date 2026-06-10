// backend/config/passport.js
const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcryptjs");
const db = require("./prisma");

const getUserByEmail = async (email) => {
  if (!email) return null;
  return await db.users.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
};

const getUserById = async (id) => {
  if (!id) return null;
  return await db.users.findUnique({
    where: { id: id },
  });
};

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await getUserByEmail(email);

        if (!user) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const isHashedPassword = typeof user.password === "string" && user.password.startsWith("$2");
        const isMatch = isHashedPassword
          ? await bcrypt.compare(password, user.password)
          : password === user.password;

        if (!isMatch) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
