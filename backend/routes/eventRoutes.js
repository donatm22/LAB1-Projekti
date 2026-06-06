const express = require("express");
const fs = require("fs/promises");
const verifyToken = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const checkEventOwnership = require("../middleware/eventOwnershipMiddleware");
const upload = require("../middleware/eventUploadMiddleware");
const {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getManagedEvents
} = require("../controllers/eventControllers");

const router = express.Router();

const isAllowedImageSignature = (buffer, mimetype) => {
    if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
        return false;
    }

    if (mimetype === "image/jpeg") {
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    if (mimetype === "image/png") {
        return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }

    if (mimetype === "image/gif") {
        const signature = buffer.subarray(0, 6).toString("ascii");
        return signature === "GIF87a" || signature === "GIF89a";
    }

    if (mimetype === "image/webp") {
        return buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
            buffer.subarray(8, 12).toString("ascii") === "WEBP";
    }

    return false;
};

const removeUploadedFiles = async (files = []) => {
    await Promise.allSettled(
        files.map((file) => fs.unlink(file.path))
    );
};

const handleEventUpload = (req, res, next) => {
    upload.array("imazhi", 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                message: err.message || "Failed to upload event image",
                code: err.code || "UPLOAD_ERROR",
            });
        }

        const files = Array.isArray(req.files) ? req.files : [];

        Promise.all(files.map(async (file) => {
            const header = await fs.readFile(file.path).then((buffer) => buffer.subarray(0, 16));
            if (!isAllowedImageSignature(header, file.mimetype)) {
                throw new Error("Uploaded file content does not match an allowed image type");
            }
        }))
            .then(() => next())
            .catch(async (validationError) => {
                await removeUploadedFiles(files);
                res.status(400).json({
                    message: validationError.message || "Invalid image upload",
                    code: "UPLOAD_VALIDATION_ERROR",
                });
            });
    });
};

router.get("/", optionalAuth, getEvents);

router.get("/managed", verifyToken, allowRoles("admin", "organizer"), getManagedEvents);

router.get("/:id", getEventById);

router.post("/POST", verifyToken, allowRoles("admin", "organizer"), handleEventUpload, createEvent);

router.put("/PUT/:id", verifyToken, checkEventOwnership, handleEventUpload, updateEvent);

router.delete("/DELETE/:id", verifyToken, checkEventOwnership, deleteEvent);


module.exports = router;
