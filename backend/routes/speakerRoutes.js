const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const{
    getSpeakers,
    getSpeakersById,
    createSpeakers,
    updateSpeakers,
    deleteSpeakers
} = require ("../controllers/speakersControllers");

const router = express.Router();

router.get("/", getSpeakers);

router.get("/:id", getSpeakersById);

router.post("/", verifyToken, allowRoles("admin", "organizer"), createSpeakers);

router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateSpeakers);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteSpeakers);

module.exports = router;
