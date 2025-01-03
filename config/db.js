const mongoose = require("mongoose");

const dbURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("Connected to MongoDB!!!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err; // Throw error to be handled by caller instead of exiting
  }
};

module.exports = connectDB;
