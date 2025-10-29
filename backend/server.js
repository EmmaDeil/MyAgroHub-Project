const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const farmerRoutes = require("./routes/farmers");
const adminRoutes = require("./routes/admin");

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Smart Database connection with multiple fallbacks
const DatabaseConnector = require("./utils/DatabaseConnector");

const connectToDatabase = async () => {
  const dbConnector = new DatabaseConnector();

  try {
    const connectionType = await dbConnector.connect();
    const info = dbConnector.getConnectionInfo();

    console.log("� Database connection established!");
    console.log(`📊 Connection type: ${connectionType.toUpperCase()}`);
    console.log(`🌱 Database: ${info.name}`);
    console.log(`🏠 Host: ${info.host}`);

    return connectionType;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

connectToDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "AgriTech Backend Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🌾 Welcome to AgriTech Backend API",
    version: "1.0.0",
    docs: "/api/docs",
    health: "/api/health",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, _next) => {
  console.error("❌ Server Error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 AgriTech Backend Server running on port", PORT);
  console.log("🌍 Environment:", process.env.NODE_ENV);
  console.log("📱 Frontend URL:", process.env.FRONTEND_URL);
  console.log("📊 Admin Email:", process.env.ADMIN_EMAIL);
});

module.exports = app;
