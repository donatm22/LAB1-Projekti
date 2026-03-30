const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventControllers");

const router = express.Router();

router.get("/", getEvents);

router.get("/:id", getEventById);

router.post("/POST", verifyToken, allowRoles("admin", "organizer"), createEvent);

router.put("/PUT/:id", verifyToken, allowRoles("admin", "organizer"), updateEvent);

router.delete("/DELETE/:id", verifyToken, allowRoles("admin"), deleteEvent);

module.exports = router;
