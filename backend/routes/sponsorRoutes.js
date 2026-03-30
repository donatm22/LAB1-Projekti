const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
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

router.post("/", verifyToken, allowRoles("admin", "organizer"), createSponsor);

router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateSponsor);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteSponsor);

module.exports = router;
