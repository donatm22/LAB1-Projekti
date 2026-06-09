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
    getRegistrationQRCode,
    verifyRegistrationQRCode
} = require("../controllers/registrationController");

const router = express.Router();

router.get("/", verifyToken, allowRoles("admin", "organizer"), getRegistrations);
router.get("/event/:event_id", verifyToken, allowRoles("admin", "organizer"), getRegistrationsByEvent);
router.get("/user/:user_id", verifyToken, getRegistrationsByUser);
router.get("/:id", verifyToken, getRegistrationById);
router.get("/:id/pdf", verifyToken, getRegistrationPDF);
router.get("/:id/qr", verifyToken, getRegistrationQRCode);
router.post("/qr/verify", verifyToken, allowRoles("admin", "organizer"), verifyRegistrationQRCode);
router.post("/", verifyToken, createRegistration);
router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateRegistration);
router.delete("/:id", verifyToken, allowRoles("admin"), deleteRegistration);

module.exports = router;
