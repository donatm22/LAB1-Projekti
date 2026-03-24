const express = require("express");
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

router.post("/POST", createEvent);

router.put("/PUT/:id", updateEvent);

router.delete("/DELETE/:id", deleteEvent);

module.exports = router;