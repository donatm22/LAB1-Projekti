const db = require("../config/prisma");
const {
  isNonEmptyString,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  trimString,
} = require("../utils/validation");

const organizerFields = [
  "emri_organizates",
  "pershkrimi",
  "email",
  "telefoni",
  "website",
];

const normalizeOrganizer = (body) => {
  const normalized = {};
  organizerFields.forEach((field) => {
    const value = body[field];
    if (value === null || value === undefined) {
      normalized[field] = null;
    } else {
      const trimmed = trimString(value);
      normalized[field] = trimmed || null;
    }
  });
  return normalized;
};

const validateOrganizer = (body) => {
  if (body.emri_organizates && !isNonEmptyString(body.emri_organizates)) {
    return "Emri i organizates nuk eshte valid";
  }

  if (body.email && !isValidEmail(body.email)) {
    return "Email i organizates nuk eshte valid";
  }

  if (body.telefoni && !isValidPhone(body.telefoni)) {
    return "Telefoni duhet te permbaje vetem shifra dhe simbole valide";
  }

  if (body.website && !isValidUrl(body.website)) {
    return "Website duhet te jete URL valide";
  }

  return null;
};

const getOrganizers = async (req, res) => {
  try {
    const records = await db.organizers.findMany({
      orderBy: { id: "asc" },
    });
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getOrganizerById = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await db.organizers.findUnique({
      where: { id: id },
    });

    if (!record) {
      return res.status(404).json({ message: "Organizatori nuk u gjet" });
    }

    return res.json(record);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createOrganizer = async (req, res) => {
  try {
    const validationError = validateOrganizer(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedData = normalizeOrganizer(req.body);

    const newRecord = await db.organizers.create({
      data: normalizedData,
    });

    return res.status(201).json({
      message: "Organizatori u shtua me sukses",
      organizer: newRecord,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    const validationError = validateOrganizer(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedData = normalizeOrganizer(req.body);

    const updatedRecord = await db.organizers.update({
      where: { id: id },
      data: normalizedData,
    });

    return res.status(200).json({
      message: "Organizatori u perditesua me sukses",
      organizer: updatedRecord,
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Organizatori nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteOrganizer = async (req, res) => {
  try {
    const { id } = req.params;
    const isOrganizer = req.user?.roli === "organizer";

    if (isOrganizer) {
      return res.status(403).json({
        message: "Access denied. Only admins can delete organizers.",
      });
    }

    await db.organizers.delete({
      where: { id: id },
    });

    return res.json({ message: "Organizatori u fshi me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Organizatori nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getOrganizers,
  getOrganizerById,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer,
};
