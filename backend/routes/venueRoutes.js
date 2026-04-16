const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue
} = require("../controllers/venuesController");

const router = express.Router();

router.get("/", getVenues);
router.get("/:id", getVenueById);
router.post("/", verifyToken, allowRoles("admin", "organizer"), createVenue);
router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateVenue);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteVenue);

module.exports = router;
