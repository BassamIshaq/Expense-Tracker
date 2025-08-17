const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");

// Load environment variables
dotenv.config();

// Route imports
const expenseRoutes = require("./routes/expenses");
const categoryRoutes = require("./routes/categories");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

// Initialize Express app
const app = express();

// Current date for logging
console.log(`Server starting at: ${new Date().toISOString()}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // HTTP request logger
app.use(helmet()); // Security headers

// MongoDB Connection
const connectDB = require("./config/db");

// API Routes
app.use("/api/expenses", expenseRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// API Status route
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    time: new Date().toISOString(),
    version: "1.0.0",
    author: "BassamIshaq",
    timestamp: "2025-08-15 14:16:21",
  });
});

// Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  // Set static folder
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend", "build", "index.html"));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err,
    timestamp: new Date().toISOString(),
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
