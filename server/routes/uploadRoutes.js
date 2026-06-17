const express = require("express");
const router = express.Router();
const { upload, uploadFile } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");

router.post("/", protect, upload.single("file"), uploadFile);

module.exports = router;
