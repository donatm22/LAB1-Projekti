const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const{
    getEventSponsor,
    getEventSponsorById,
    createEventSponsor,
    updateEventSponsor,
    deleteEventSponsor
} = require ("../controllers/eventSponsorControllers");

const router = express.Router();

router.get("/", getEventSponsor);

router.get("/:id", getEventSponsorById);

router.post("/", verifyToken, allowRoles("admin", "organizer"), createEventSponsor);

router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateEventSponsor);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteEventSponsor);

module.exports = router;
