const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const {
    getRegistrations,
    getRegistrationById,
    getRegistrationsByEvent,
    getRegistrationsByUser,
    createRegistration,
    updateRegistration,
    deleteRegistration,
    getRegistrationPDF,
    getRegistrationQRCode
} = require("../controllers/registrationController");

const router = express.Router();

router.get("/", verifyToken, allowRoles("admin", "organizer"), getRegistrations);
router.get("/event/:event_id", verifyToken, getRegistrationsByEvent);
router.get("/user/:user_id", verifyToken, getRegistrationsByUser);
router.get("/:id", verifyToken, getRegistrationById);
router.get("/:id/pdf", getRegistrationPDF);
router.get("/:id/qr", getRegistrationQRCode);
router.post("/", verifyToken, createRegistration);
router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateRegistration);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteRegistration);

module.exports = router;