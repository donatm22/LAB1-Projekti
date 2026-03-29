const express = require("express");
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

router.post("/", createSpeakers);

router.put("/:id", updateSpeakers);

router.delete("/:id", deleteSpeakers);

module.exports = router;
