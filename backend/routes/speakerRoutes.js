const express = require("express");
const{
    getSpeakers,
    getSpeakersByID,
    createSpeakers,
    updateSpeakers,
    deleteSpeakers
} = require ("../controllers/speakersControllers");

const router = express.Router();

router.get("/", getSpeakers);

router.get("/:id", getSpeakersByID);

router.post("/", createSpeakers);

router.put("/:id", updateSpeakers);

router.delete("/:id", deleteSpeakers);

module.exports = router;
