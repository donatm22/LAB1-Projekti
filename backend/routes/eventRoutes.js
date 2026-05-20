const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/eventUploadMiddleware");
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} = require("../controllers/eventControllers");

const router = express.Router();

const handleEventUpload = (req, res, next) => {
    upload.single("imazhi")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: err.message || "Failed to upload event image",
                code: err.code || "UPLOAD_ERROR",
            });
        }

        next();
    });
};

router.get("/", getEvents);

router.get("/:id", getEventById);

router.post("/POST", verifyToken, allowRoles("admin", "organizer"), handleEventUpload, createEvent);

router.put("/PUT/:id", verifyToken, allowRoles("admin", "organizer"), handleEventUpload, updateEvent);

router.delete("/DELETE/:id", verifyToken, allowRoles("admin"), deleteEvent);

module.exports = router;
