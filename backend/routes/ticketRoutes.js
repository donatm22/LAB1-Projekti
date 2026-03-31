const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const{
    getTickets,
    getTicketByID,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketPDF
} = require ("../controllers/ticketController");

const router = express.Router();

router.get("/", getTickets);

router.get("/:id", getTicketByID);

router.post("/", verifyToken, allowRoles("admin", "organizer"), createTicket);

router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateTicket);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteTicket);

// no verifyToken for now, sa per me e testu
router.get("/:id/pdf", getTicketPDF);

module.exports = router;