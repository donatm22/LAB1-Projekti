require("../config/env");
const db = require("../../database/db");
const {
  ACCESS_TOKEN_EXPIRES_IN,
  clearRefreshTokenCookie,
  createAccessToken,
  createRefreshToken,
  getRefreshTokenCookie,
  hashToken,
  revokeRefreshSession,
  rotateRefreshSession,
  setRefreshTokenCookie,
  storeRefreshSession,
  verifyRefreshToken,
} = require("../services/sessionService");

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
};

const login = async (req, res) => {
  const user = req.user;
  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  if (!token) {
    return res.status(500).json({ message: "JWT secret is not configured" });
  }

  if (!refreshToken) {
    return res.status(500).json({ message: "Refresh token secret is not configured" });
  }

  try {
    await storeRefreshSession(user, refreshToken);
    setRefreshTokenCookie(res, refreshToken);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create session" });
  }

  return res.json({
    message: "Login successful",
    token,
    tokenType: "Bearer",
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    user: sanitizeUser(user)
  });
};

const getCurrentSession = (req, res) => {
  db.query('SELECT * FROM "Users" WHERE id = $1 LIMIT 1', [req.user.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      authenticated: true,
      user: sanitizeUser(result.rows[0])
    });
  });
};

const refreshSession = async (req, res) => {
  const refreshToken = getRefreshTokenCookie(req);

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const session = await db.query(
      'SELECT * FROM "RefreshTokens" WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1',
      [hashToken(refreshToken)]
    );

    if (session.rows.length === 0) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Refresh session expired or revoked" });
    }

    const currentUserResult = await db.query(
      'SELECT * FROM "Users" WHERE id = $1 LIMIT 1',
      [decoded.id]
    );

    if (currentUserResult.rows.length === 0) {
      await revokeRefreshSession(refreshToken);
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "User not found" });
    }

    const user = currentUserResult.rows[0];
    const nextAccessToken = createAccessToken(user);

    if (!nextAccessToken) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const nextRefreshToken = await rotateRefreshSession(user, refreshToken);
    setRefreshTokenCookie(res, nextRefreshToken);

    return res.json({
      message: "Session refreshed",
      token: nextAccessToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      user: sanitizeUser(user)
    });
  } catch (error) {
    const isAuthError =
      error?.statusCode === 401 ||
      error?.name === "TokenExpiredError" ||
      error?.name === "JsonWebTokenError";

    if (isAuthError) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({
        message:
          error.name === "TokenExpiredError"
            ? "Refresh token expired"
            : "Invalid refresh token"
      });
    }

    console.error("Refresh session failed:", error.message);
    return res.status(500).json({
      message: "Failed to refresh session"
    });
  }
};

const logout = async (req, res) => {
  const refreshToken = getRefreshTokenCookie(req);

  if (refreshToken) {
    try {
      await revokeRefreshSession(refreshToken);
    } catch (error) {
      console.error("Failed to revoke refresh token:", error.message);
    }
  }

  clearRefreshTokenCookie(res);

  return res.json({
    message: "Logout successful."
  });
};

module.exports = {
  login,
  getCurrentSession,
  refreshSession,
  logout,
  sanitizeUser
};
