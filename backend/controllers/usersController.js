const bcrypt = require("bcryptjs");
const db = require("../../database/db");
const { sanitizeUser } = require("./authController");
const { revokeUserRefreshSessions } = require("../services/sessionService");
const { isLettersOnly, isValidEmail, trimString } = require("../utils/validation");

const isAdmin = (req) => req.user?.roli === "admin";
const canAccessUser = (req, userId) => isAdmin(req) || String(req.user?.id) === String(userId);
const allowedRoles = new Set(["user", "admin", "organizer", "attendee"]);

const userSelectionFields = {
  id: true,
  emri: true,
  email: true,
  roli: true,
  created_at: true,
};

const getUsers = async (req, res) => {
  try {
    const users = await db.users.findMany({
      select: userSelectionFields,
      orderBy: { id: "asc" },
    });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!canAccessUser(req, id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await db.users.findUnique({
      where: { id: id },
      select: userSelectionFields,
    });

    if (!user) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { emri, email, password, roli } = req.body;

    if (!emri || !email || !password || !roli) {
      return res.status(400).json({ message: "Ploteso emri, email, password dhe roli" });
    }

    if (!isLettersOnly(emri)) {
      return res.status(400).json({ message: "Emri duhet te permbaje vetem shkronja" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email nuk eshte valid" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password duhet te kete te pakten 6 karaktere" });
    }

    if (!allowedRoles.has(roli)) {
      return res.status(400).json({ message: "Roli nuk eshte valid" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await db.users.create({
      data: {
        emri: trimString(emri),
        email: trimString(email).toLowerCase(),
        password: hashedPassword,
        roli: roli,
      },
      select: userSelectionFields,
    });

    return res.status(201).json({
      message: "Registration successful. Your account has been saved.",
      user: newUser,
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { emri, email, password, roli } = req.body;

    if (!canAccessUser(req, id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!emri || !email) {
      return res.status(400).json({ message: "Ploteso emri dhe email" });
    }

    if (!isLettersOnly(emri)) {
      return res.status(400).json({ message: "Emri duhet te permbaje vetem shkronja" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email nuk eshte valid" });
    }

    if (password && String(password).length < 6) {
      return res.status(400).json({ message: "Password duhet te kete te pakten 6 karaktere" });
    }

    const existingUser = await db.users.findUnique({ where: { id: id } });
    if (!existingUser) {
      return res.status(404).json({ message: "User nuk u gjet" });
    }

    const nextRole = isAdmin(req) && roli ? roli : existingUser.roli;
    if (!allowedRoles.has(nextRole)) {
      return res.status(400).json({ message: "Roli nuk eshte valid" });
    }

    const nextPassword = password ? bcrypt.hashSync(password, 10) : existingUser.password;

    const updatedUser = await db.users.update({
      where: { id: id },
      data: {
        emri: trimString(emri),
        email: trimString(email).toLowerCase(),
        password: nextPassword,
        roli: nextRole,
      },
    });

    if (password) {
      try {
        await revokeUserRefreshSessions(id);
      } catch (sessionError) {
        console.error("Failed to revoke user refresh sessions:", sessionError.message);
      }
    }

    return res.json({
      message: "User u perditesua me sukses",
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isOrganizer = req.user?.roli === "organizer";

    if (isOrganizer) {
      return res.status(403).json({
        message: "Access denied. Only admins can delete users.",
      });
    }

    await db.users.delete({
      where: { id: id },
    });

    return res.json({ message: "User u fshi me sukses" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "User nuk u gjet" });
    }
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};