const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    interests: [String],
    emailOtp: Number,
    passwordOtp: Number,
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Online", "Busy", "Offline"],
      default: "Offline",
    },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
