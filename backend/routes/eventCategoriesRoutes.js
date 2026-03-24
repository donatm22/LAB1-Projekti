const express = require("express");
const{
        getEventCategories,
    getEventCategoriesByID,
    createEventCategories,
    updateEventCategories,
    deleteEventCategories
} = require ("../controllers/eventCategoriesControllers");

const router = express.Router();

router.get("/", getEventCategories);

router.get("/:id", getEventCategoriesByID);

router.post("/", createEventCategories);

router.put("/:id", updateEventCategories);

router.delete("/:id", deleteEventCategories);

module.exports = router;
