const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getOrganizers,
  getOrganizerById,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer
} = require("../controllers/organizersController");

const router = express.Router();

router.get("/", getOrganizers);
router.get("/:id", getOrganizerById);
router.post("/", verifyToken, allowRoles("admin", "organizer"), createOrganizer);
router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateOrganizer);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteOrganizer);

module.exports = router;
