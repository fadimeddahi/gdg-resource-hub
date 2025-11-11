// src/server.js
// Main server file with security best practices and production-ready configuration

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import guideRoutes from "./routes/guideRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import savedFolderRoutes from "./routes/savedFolderRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// ============================================
// CONFIGURATION
// ============================================

// Emulate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Validate required environment variables
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in environment variables");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================
// DATABASE CONNECTION
// ============================================

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Set security HTTP headers
app.use(helmet());

// Rate limiting - prevent brute force attacks
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api", limiter);

// Prevent NoSQL injection attacks
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp());

// ============================================
// GENERAL MIDDLEWARE
// ============================================

// Enable CORS
// Allow configuring allowed origins via the CORS_ORIGIN env var (comma-separated)
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite default port
  'http://localhost:5174', // Alternative Vite port
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
  : defaultOrigins;

const corsOptions = {
  origin: corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
};

app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: "10mb" })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Compression middleware
app.use(compression());

// Logging middleware (only in development)
if (NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // In production, use combined format (Apache style)
  app.use(morgan("combined"));
}

// ============================================
// API ROUTES (v1)
// ============================================

app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/guides", guideRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/templates", templateRoutes);
app.use("/api/v1/saved-folders", savedFolderRoutes);

// Backwards compatibility (optional - remove after migration)
app.use("/api/resources", resourceRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/folders", folderRoutes);


// ...
app.use("/api/v1/auth", authRoutes);

// backwards-compat optional:
app.use("/api/auth", authRoutes);


// ============================================
// HEALTH CHECK & ROOT ENDPOINTS
// ============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GDG Resource Hub API",
    version: "1.0.0",
    endpoints: {
      resources: "/api/v1/resources",
      departments: "/api/v1/departments",
      users: "/api/v1/users",
      health: "/health",
    },
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler - must be after all routes
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================

// Initialize departments helper function
const initializeDepartments = async () => {
  const Department = (await import("./models/Department.js")).default;
  
  const departments = [
    { slug: "design", name: "Design" },
    { slug: "dev", name: "Development" },
    { slug: "comm", name: "Communication" },
    { slug: "hr", name: "Human Resources" },
    { slug: "logistics", name: "Logistics" },
    { slug: "multimedia", name: "Multimedia" },
    { slug: "external", name: "External Relations" },
  ];

  for (const dept of departments) {
    const existing = await Department.findOne({ slug: dept.slug });
    if (!existing) {
      await Department.create(dept);
      console.log(`✅ Created department: ${dept.name}`);
    }
  }
};

const start = async () => {
  try {
    await connectDB();
    
    // Initialize departments if they don't exist
    const Department = (await import("./models/Department.js")).default;
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      console.log("📋 Initializing departments...");
      await initializeDepartments();
      console.log("✅ Departments initialized");
    }
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
    });

    // ============================================
    // GRACEFUL SHUTDOWN
    // ============================================

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌ UNHANDLED REJECTION! Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM (e.g., from Heroku, Docker)
    process.on("SIGTERM", () => {
      console.log("👋 SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Process terminated");
      });
    });

    // Handle SIGINT (Ctrl+C)
    process.on("SIGINT", () => {
      console.log("\n👋 SIGINT received. Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1);
  }
};
start();

export default app;
