const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
  getTicketTypes,
  getTicketTypeById,
  createTicketType,
  updateTicketType,
  deleteTicketType
} = require("../controllers/ticketTypesController");

const router = express.Router();

router.get("/", getTicketTypes);
router.get("/:id", getTicketTypeById);
router.post("/", verifyToken, allowRoles("admin", "organizer"), createTicketType);
router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateTicketType);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteTicketType);

module.exports = router;
