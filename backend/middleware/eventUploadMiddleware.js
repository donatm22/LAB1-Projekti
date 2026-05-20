const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads", "events");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, callback) => {
    callback(null, uploadDir);
  },
  filename: (_, file, callback) => {
    const safeExtension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`;
    callback(null, uniqueName);
  },
});

const fileFilter = (_, file, callback) => {
  if (!file.mimetype.startsWith("image/")) {
    return callback(new Error("Only image uploads are allowed"));
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;