// NPM Packages
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Project files and routes
const connectDB = require("./config/db");
const apiRouter = require("./routes");
// Middlewares
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", // Allow React frontend origin
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.static("public"));

// Connecting routes
app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.json("Welcome to t_world_app");
});

const PORT = process.env.PORT || 5005;
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
