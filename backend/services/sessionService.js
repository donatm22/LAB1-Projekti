// backend/services/sessionService.js
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../config/prisma");
require("../config/env");

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : `${process.env.JWT_SECRET || "change-me"}-refresh`);

if (process.env.NODE_ENV === "production" && !ACCESS_TOKEN_SECRET) {
  throw new Error("JWT_SECRET must be configured in production");
}

if (process.env.NODE_ENV === "production" && !REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET must be configured in production");
}

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

const durationPattern = /^(\d+)([smhd])$/i;

const parseDurationToMs = (duration) => {
  if (typeof duration === "number" && Number.isFinite(duration)) {
    return duration;
  }

  const match = String(duration || "").trim().match(durationPattern);

  if (!match) {
    return 0;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitMap = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * (unitMap[unit] || 0);
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token || ""), "utf8").digest("hex");

const createAccessToken = (user) => {
  if (!ACCESS_TOKEN_SECRET) {
    return null;
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roli: user.roli,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

const createRefreshToken = (user) => {
  if (!REFRESH_TOKEN_SECRET) {
    return null;
  }

  const jti = crypto.randomUUID();

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roli: user.roli,
      jti,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

const verifyRefreshToken = (token) => {
  if (!REFRESH_TOKEN_SECRET) {
    return null;
  }

  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

const getRefreshTokenCookie = (req) => {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").reduce((acc, part) => {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex === -1) {
      return acc;
    }

    const name = decodeURIComponent(part.slice(0, separatorIndex).trim());
    const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
    acc[name] = value;
    return acc;
  }, {});

  return cookies.refresh_token || null;
};

const getRefreshCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/auth",
  maxAge: maxAgeMs,
});

const setRefreshTokenCookie = (res, token) => {
  const maxAgeMs = parseDurationToMs(REFRESH_TOKEN_EXPIRES_IN);

  res.cookie("refresh_token", token, getRefreshCookieOptions(maxAgeMs));
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth",
  });
};


const storeRefreshSession = async (user, refreshToken) => {
  const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseDurationToMs(REFRESH_TOKEN_EXPIRES_IN));

  await db.refreshTokens.create({
    data: {
      user_id: user.id,
      token_jti: decoded.jti || crypto.randomUUID(),
      token_hash: tokenHash,
      expires_at: expiresAt,
    },
  });

  return { tokenHash, expiresAt };
};

const findActiveRefreshSession = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);


  return await db.refreshTokens.findFirst({
    where: {
      token_hash: tokenHash,
      revoked_at: null,
      expires_at: {
        gt: new Date(),
    },
  },
});
};

const revokeRefreshSession = async (refreshToken) => {
  const tokenHash = hashToken(refreshToken);

  await db.refreshTokens.updateMany({
    where: {
      token_hash: tokenHash,
      revoked_at: null,
      },
    data: {
      revoked_at: new Date(),
    },
  });
};

const revokeUserRefreshSessions = async (userId) => {
  // Replaced raw UPDATE query to cascade revoke all sessions for a user
  await db.refreshTokens.updateMany({
    where: {
      user_id: userId,
      revoked_at: null,
    },
    data: {
      revoked_at: new Date(),
    },
  });
};

const rotateRefreshSession = async (user, currentRefreshToken) => {
  const currentSession = await findActiveRefreshSession(currentRefreshToken);

  if (!currentSession) {
    const error = new Error("Refresh session not found");
    error.statusCode = 401;
    throw error;
  }

  // Replaced raw DELETE statement
  await db.refreshTokens.delete({
    where: {
      id: currentSession.id,
    },
  });

  const nextRefreshToken = createRefreshToken(user);

  if (!nextRefreshToken) {
    const error = new Error("Refresh token secret is not configured");
    error.statusCode = 500;
    throw error;
  }

  await storeRefreshSession(user, nextRefreshToken);
  return nextRefreshToken;
};

const getRefreshTokenExpiresIn = () => REFRESH_TOKEN_EXPIRES_IN;

module.exports = {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  clearRefreshTokenCookie,
  createAccessToken,
  createRefreshToken,
  findActiveRefreshSession,
  getRefreshCookieOptions,
  getRefreshTokenCookie,
  getRefreshTokenExpiresIn,
  hashToken,
  parseDurationToMs,
  revokeRefreshSession,
  revokeUserRefreshSessions,
  rotateRefreshSession,
  setRefreshTokenCookie,
  verifyRefreshToken,
  storeRefreshSession,
};
