const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const leadRoutes = require("./routes/leadRoutes");
const contentRoutes = require("./routes/contentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Initialize DB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS setup
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback to allow dev convenience
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploads folder statically (local fallback upload storage)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin/upload", uploadRoutes);

// Serve Frontend static assets in production
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// Catch-all route to serve the React index.html for React Router compatibility
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) => {
    if (err) {
      // If client build is not built yet, return a simple running indicator
      res.status(200).send("Florinaa API Server is running. Client build not found (run npm run build in client).");
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "An unexpected server error occurred",
  });
});

app.listen(PORT, () => {
  console.log(`Express Server running on port ${PORT}`);
});
