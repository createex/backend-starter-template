// Import required NPM packages
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import project files and routes
const connectDB = require("./config/db");
const apiRouter = require("./routes");
const { errorMiddleware } = require("./middleware/errorHandlerMiddleware");

// Initialize Express app
const app = express();

// Configure middleware
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded payloads
app.use(express.static("public")); // Serve static files from 'public' directory
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // Use env variable for client URL or allow all
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Define routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to t_world_app" });
});
app.use("/api", apiRouter);

// Error handling middleware
app.use(errorMiddleware);

// Start the server
const PORT = process.env.PORT || 5005;

const start = async () => {
  try {
    await connectDB(); // Connect to MongoDB
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Initialize the application
start();
