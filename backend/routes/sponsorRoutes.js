const express = require("express");
const{
    getSponsors,
    getSponsorById,
    createSponsor,
    updateSponsor,
    deleteSponsor
} = require ("../controllers/sponsorController");

const router = express.Router();

router.get("/", getSponsors);

router.get("/:id", getSponsorById);

router.post("/", createSponsor);

router.put("/:id", updateSponsor);

router.delete("/:id", deleteSponsor);

module.exports = router;
