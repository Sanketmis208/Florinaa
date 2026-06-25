const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary if credentials are set and not placeholder
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== "your_api_key" &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== "your_api_secret";

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer storage configuration (temp files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|gif|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, webp, gif) and PDFs are allowed"));
    }
  },
});

// @desc    Upload media file
// @route   POST /api/admin/upload
// @access  Private
const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Please upload a file" });
  }

  const localFilePath = req.file.path;

  try {
    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(localFilePath, {
        folder: "florinaa",
        resource_type: "auto",
      });

      // Clean up local temp file
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error("Failed to delete temp file:", err);
      }

      res.json({
        url: result.secure_url,
        public_id: result.public_id,
      });
    } else {
      // Local fallback: return local relative URL
      // We will host server/public/uploads as /uploads
      const relativeUrl = `/uploads/${req.file.filename}`;
      res.json({
        url: relativeUrl,
        filename: req.file.filename,
        isLocal: true,
      });
    }
  } catch (error) {
    // Clean up local file in case of error
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error("Failed to delete temp file on error:", err);
      }
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = { upload, uploadFile };
