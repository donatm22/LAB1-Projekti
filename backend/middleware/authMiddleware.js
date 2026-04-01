const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  if (!secret) {
    return res.status(500).json({
      message: "JWT secret is not configured"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret);
    req.authToken = token;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.name === "TokenExpiredError" ? "Token expired" : "Invalid token"
    });
  }
};

module.exports = verifyToken;
