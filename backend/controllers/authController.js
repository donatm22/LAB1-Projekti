const jwt = require("jsonwebtoken");

const login = (req, res) => {
  const user = req.user;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: "JWT secret is not configured" });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      roli: user.roli
    },
    secret,
    { expiresIn: "1d" }
  );

  const { password, ...safeUser } = user;

  return res.json({
    message: "Login successful",
    token,
    user: safeUser
  });
};

module.exports = {
  login
};
