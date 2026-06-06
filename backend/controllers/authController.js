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
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const login = async (req, res) => {
  const user = req.user;
  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  if (!token) return res.status(500).json({ message: "JWT secret is not configured" });
  if (!refreshToken) return res.status(500).json({ message: "Refresh token secret is not configured" });

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
    user: sanitizeUser(user),
  });
};

const getCurrentSession = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await db.users.findUnique({ 
      where: { id: parseInt(req.user.id, 10) } 
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ authenticated: true, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const refreshSession = async (req, res) => {
  const refreshToken = getRefreshTokenCookie(req);

  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const userId = decoded?.id || decoded?.userId || decoded?.sub;

    if (!userId || typeof userId !== "string") {
      console.warn("[Refresh Bypass]: Invalid or non-string JWT payload ID:", userId);
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Session payload invalid. Please log in again." });
    }

    const session = await db.refreshTokens.findFirst({
      where: {
        token_hash: hashToken(refreshToken),
        revoked_at: null,
        expires_at: { gt: new Date() },
      },
    });

    if (!session) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Refresh session expired or revoked" });
    }

    const user = await db.users.findUnique({ 
      where: { id: userId } 
    });

    if (!user) {
      await revokeRefreshSession(refreshToken);
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "User not found" });
    }

    const nextAccessToken = createAccessToken(user);
    if (!nextAccessToken) return res.status(500).json({ message: "JWT secret is not configured" });

    const nextRefreshToken = await rotateRefreshSession(user, refreshToken);
    setRefreshTokenCookie(res, nextRefreshToken);

    return res.json({
      message: "Session refreshed",
      token: nextAccessToken,
      tokenType: "Bearer",
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      user: sanitizeUser(user),
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
          error.name === "TokenExpiredError" ? "Refresh token expired" : "Invalid refresh token",
      });
    }

    console.error("Refresh session failed:", error);
    return res.status(500).json({ message: "Failed to refresh session", details: error.message });
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
  return res.json({ message: "Logout successful." });
};

module.exports = { login, getCurrentSession, refreshSession, logout, sanitizeUser };