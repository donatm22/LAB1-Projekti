const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getEventSchedules,
  getEventSchedulesById,
  createEventSchedules,
  updateEventSchedules,
  deleteEventSchedules
} = require("../controllers/eventSchedulesController");

const router = express.Router();

router.get("/", getEventSchedules);
router.get("/:id", getEventSchedulesById);
router.post("/", verifyToken, allowRoles("admin", "organizer"), createEventSchedules);
router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateEventSchedules);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteEventSchedules);

module.exports = router;
