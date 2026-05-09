const jwt = require("jsonwebtoken");
require("../config/env");
const { getUserById } = require("../../database/usersStore");

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

const createToken = (user) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return null;
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roli: user.roli
    },
    secret,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
};

const login = (req, res) => {
  const user = req.user;
  const token = createToken(user);

  if (!token) {
    return res.status(500).json({ message: "JWT secret is not configured" });
  }

  return res.json({
    message: "Login successful",
    token,
    tokenType: "Bearer",
    expiresIn: TOKEN_EXPIRES_IN,
    user: sanitizeUser(user)
  });
};

const getCurrentSession = (req, res) => {
  getUserById(req.user.id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        authenticated: true,
        user: sanitizeUser(user)
      });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

const logout = (req, res) => {
  return res.json({
    message: "Logout successful. Remove the bearer token on the client."
  });
};

module.exports = {
  login,
  getCurrentSession,
  logout,
  sanitizeUser
};
