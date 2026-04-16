const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance
} = require("../controllers/attendanceController");

const router = express.Router();

router.get("/", verifyToken, allowRoles("admin", "organizer"), getAttendance);
router.get("/:id", verifyToken, getAttendanceById);
router.post("/", verifyToken, allowRoles("admin", "organizer"), createAttendance);
router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateAttendance);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteAttendance);

module.exports = router;
