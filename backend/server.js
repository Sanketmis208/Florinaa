const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
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

// Trust first proxy (required for Render, Vercel, etc. — fixes rate-limiter IP detection)
app.set("trust proxy", 1);

// Rate Limiter Configurations
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests from this IP, please try again after 15 minutes."
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please try again after 15 minutes."
  }
});

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 form submissions per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many inquiries submitted from this IP. Please try again later."
  }
});

// Build dynamic CSP connect sources based on environment
const connectSources = ["'self'", "*.cloudinary.com"];
if (process.env.NODE_ENV !== "production") {
  connectSources.push("http://localhost:3000", "ws://localhost:5173", "http://localhost:5173");
}
if (process.env.CLIENT_URL) {
  connectSources.push(process.env.CLIENT_URL);
}

// Mount Helmet for security headers (including Content Security Policy)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "*.cloudinary.com",
          "images.unsplash.com"
        ],
        connectSrc: connectSources,
        mediaSrc: ["'self'", "*.cloudinary.com"],
        frameSrc: ["'self'", "www.google.com", "maps.google.com", "www.google.com/maps", "maps.google.co.in", "www.google.co.in"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Apply rate limiting globally to all API routes
app.use("/api", apiLimiter);

// CORS setup
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin via Vercel rewrites)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV !== "production") {
        callback(null, true); // Allow all in development
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Prevent NoSQL query injection
app.use(mongoSanitize());

// Serve uploads folder statically (local fallback upload storage)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Apply specific rate limits to sensitive routes before mounting
app.use("/api/auth/login", loginLimiter);
app.use("/api/leads", (req, res, next) => {
  if (req.method === "POST") {
    return submitLimiter(req, res, next);
  }
  next();
});

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
