const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
    getFeedbacks,
    getFeedbackById,
    getFeedbackByEvent,
    createFeedback,
    updateFeedback,
    deleteFeedback
} = require("../controllers/feedbackControllers");

const router = express.Router();

router.get("/", getFeedbacks);

router.get("/event/:event_id", getFeedbackByEvent);

router.get("/:id", getFeedbackById);

router.post("/", verifyToken, allowRoles("admin", "organizer", "attendee"), createFeedback);

router.put("/:id", verifyToken, allowRoles("admin", "attendee"), updateFeedback);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteFeedback);

module.exports = router;