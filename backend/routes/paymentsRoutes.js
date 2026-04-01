const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const{
    getPayments,
    getPaymentsById,
    createPayment,
    updatePayment,
    deletePayments
} = require ("../controllers/paymentsControllers");

const router = express.Router();

router.get("/", getPayments);

router.get("/:id", getPaymentsById);

router.post("/", verifyToken, allowRoles("admin", "organizer"), createPayment);

router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updatePayment);

router.delete("/:id", verifyToken, allowRoles("admin"), deletePayments);

module.exports = router;
