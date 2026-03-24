const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/usersController");

const router = express.Router();

// GET /users - get all users
router.get("/", getUsers);

// GET /users/:id - get a single user by id
router.get("/:id", getUserById);

// POST /users - create a new user
router.post("/create", createUser);

// PUT /users/:id - update an existing user
router.put("/update/:id", updateUser);

// DELETE /users/:id - delete a user by id
router.delete("/deleteUser/:id", deleteUser);

module.exports = router;
