const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/usersController");

const router = express.Router();

router.get("/", verifyToken, allowRoles("admin"), getUsers);

router.get("/:id", verifyToken, getUserById);

router.post("/create", createUser);

router.put("/update/:id", verifyToken, updateUser);

router.delete("/deleteUser/:id", verifyToken, allowRoles("admin"), deleteUser);

module.exports = router;
