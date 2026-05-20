const jwt = require("jsonwebtoken");
require("../config/env");

const optionalAuth = (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Invalid authorization header"
    });
  }

  if (!secret) {
    return res.status(500).json({
      message: "JWT secret is not configured"
    });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, secret);
    req.authToken = token;
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: error.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
    });
  }
};

module.exports = optionalAuth;
