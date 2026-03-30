const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const{
        getEventCategories,
    getEventCategoriesById,
    createEventCategories,
    updateEventCategories,
    deleteEventCategories
} = require ("../controllers/eventCategoriesControllers");

const router = express.Router();

router.get("/", getEventCategories);

router.get("/:id", getEventCategoriesById);

router.post("/", verifyToken, allowRoles("admin", "organizer"), createEventCategories);

router.put("/:id", verifyToken, allowRoles("admin", "organizer"), updateEventCategories);

router.delete("/:id", verifyToken, allowRoles("admin"), deleteEventCategories);

module.exports = router;
