const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-.]+$/;
const PHONE_REGEX = /^\+?[0-9\s()-]{7,20}$/;

const trimString = (value) => (typeof value === "string" ? value.trim() : "");

const isNonEmptyString = (value) => trimString(value).length > 0;

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimString(value));

const isValidUrl = (value) => {
  const trimmed = trimString(value);
  if (!trimmed) {
    return false;
  }

  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const toPositiveInteger = (value) => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  const trimmed = trimString(value);
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const toNonNegativeInteger = (value) => {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
    return value;
  }

  const trimmed = trimString(value);
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
};

const toPositiveNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  const trimmed = trimString(value);
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const isValidDateTime = (value) => {
  const trimmed = trimString(value);
  return Boolean(trimmed) && !Number.isNaN(Date.parse(trimmed));
};

const isLettersOnly = (value) => NAME_REGEX.test(trimString(value));

const isValidPhone = (value) => PHONE_REGEX.test(trimString(value));

module.exports = {
  isLettersOnly,
  isNonEmptyString,
  isValidDateTime,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  toNonNegativeInteger,
  toPositiveInteger,
  toPositiveNumber,
  trimString,
};
