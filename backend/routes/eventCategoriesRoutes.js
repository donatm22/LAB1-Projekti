const express = require("express");
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

router.post("/", createEventCategories);

router.put("/:id", updateEventCategories);

router.delete("/:id", deleteEventCategories);

module.exports = router;
