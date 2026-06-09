const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const {
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/:id/read", verifyToken, markNotificationAsRead);

module.exports = router;
