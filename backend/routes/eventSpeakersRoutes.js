const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
    getEventSpeakers,
    getEventSpeakersById,
    createEventSpeakers,
    updateEventSpeakers,
    deleteEventSpeakers
} = require("../controllers/eventSpeakersControllers");

const router = express.Router();

router.get("/", getEventSpeakers);

router.get("/:id", getEventSpeakersById);

router.post("/", verifyToken, allowRoles("admin", "organizer"), createEventSpeakers);

router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateEventSpeakers);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteEventSpeakers);

module.exports = router;
