const bcrypt = require("bcryptjs");
const {
  createUser: storeCreateUser,
  deleteUser: storeDeleteUser,
  getUserById: storeGetUserById,
  listUsers,
  updateUser: storeUpdateUser
} = require("../../database/usersStore");
const { sanitizeUser } = require("./authController");

const isAdmin = (req) => req.user?.roli === "admin";

const canAccessUser = (req, userId) => isAdmin(req) || Number(req.user?.id) === Number(userId);

const getUsers = (req, res) => {
  listUsers()
    .then((users) => res.json(users))
    .catch((err) => res.status(500).json({ error: err.message }));
};

const getUserById = (req, res) => {
  const { id } = req.params;

  if (!canAccessUser(req, id)) {
    return res.status(403).json({ message: "Access denied" });
  }

  storeGetUserById(id)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User nuk u gjet" });
      }

      return res.json({
        id: user.id,
        emri: user.emri,
        email: user.email,
        roli: user.roli
      });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

const createUser = (req, res) => {
  const { emri, email, password, roli } = req.body;

  if (!emri || !email || !password || !roli) {
    return res.status(400).json({ message: "Ploteso emri, email, password dhe roli" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  storeCreateUser({ emri, email, password: hashedPassword, roli })
    .then((user) => {
      res.status(201).json({
        message: "Registration successful. Your account has been saved.",
        user
      });
    })
    .catch((err) => {
      if (err.code === "23505") {
        return res.status(409).json({ message: "Email already exists" });
      }

      return res.status(500).json({
        error: err.message
      });
    });
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { emri, email, password, roli } = req.body;

  if (!canAccessUser(req, id)) {
    return res.status(403).json({ message: "Access denied" });
  }

  if (!emri || !email) {
    return res.status(400).json({ message: "Ploteso emri dhe email" });
  }

  storeGetUserById(id)
    .then((existingUser) => {
      if (!existingUser) {
        res.status(404).json({ message: "User nuk u gjet" });
        return null;
      }

      const nextRole = isAdmin(req) && roli ? roli : existingUser.roli;
      const nextPassword = password ? bcrypt.hashSync(password, 10) : existingUser.password;

      return storeUpdateUser(id, {
        emri,
        email,
        password: nextPassword,
        roli: nextRole
      });
    })
    .then((updatedUser) => {
      if (!updatedUser) {
        return;
      }

      return res.json({
        message: "User u perditesua me sukses",
        user: sanitizeUser(updatedUser)
      });
    })
    .catch((err) => {
      if (err.code === "23505") {
        return res.status(409).json({ message: "Email already exists" });
      }

      return res.status(500).json({ error: err.message });
    });
};

const deleteUser = (req, res) => {
  const { id } = req.params;

  storeDeleteUser(id)
    .then((deleted) => {
      if (!deleted) {
        return res.status(404).json({ message: "User nuk u gjet" });
      }

      return res.json({ message: "User u fshi me sukses" });
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
