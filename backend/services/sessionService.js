const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../../database/db");
require("../config/env");

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || `${process.env.JWT_SECRET || "change-me"}-refresh`;

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

const refreshTokensTableReady = (async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS "RefreshTokens" (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
      token_jti TEXT NOT NULL UNIQUE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      revoked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON "RefreshTokens"(user_id)`
  );

  await db.query(
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON "RefreshTokens"(expires_at)`
  );
})().catch((error) => {
  console.error("Failed to initialize refresh token store:", error.message);
  throw error;
});

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

  await refreshTokensTableReady;

  await db.query(
    `INSERT INTO "RefreshTokens" (user_id, token_jti, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [user.id, decoded.jti, tokenHash, expiresAt.toISOString()]
  );

  return { tokenHash, expiresAt };
};

const findActiveRefreshSession = async (refreshToken) => {
  await refreshTokensTableReady;

  const tokenHash = hashToken(refreshToken);
  const result = await db.query(
    `SELECT * FROM "RefreshTokens"
     WHERE token_hash = $1
       AND revoked_at IS NULL
       AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  return result.rows[0] || null;
};

const revokeRefreshSession = async (refreshToken) => {
  await refreshTokensTableReady;

  const tokenHash = hashToken(refreshToken);
  await db.query(
    `UPDATE "RefreshTokens"
     SET revoked_at = NOW()
     WHERE token_hash = $1
       AND revoked_at IS NULL`,
    [tokenHash]
  );
};

const revokeUserRefreshSessions = async (userId) => {
  await refreshTokensTableReady;

  await db.query(
    `UPDATE "RefreshTokens"
     SET revoked_at = NOW()
     WHERE user_id = $1
       AND revoked_at IS NULL`,
    [userId]
  );
};

const rotateRefreshSession = async (user, currentRefreshToken) => {
  const currentSession = await findActiveRefreshSession(currentRefreshToken);

  if (!currentSession) {
    const error = new Error("Refresh session not found");
    error.statusCode = 401;
    throw error;
  }

  await db.query(`DELETE FROM "RefreshTokens" WHERE id = $1`, [currentSession.id]);

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
