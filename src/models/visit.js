const mongoose = require("mongoose");

const vistiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Initiated", "Contacted"],
    default: "Initiated",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Visit = mongoose.model("Visit", vistiSchema);
module.exports = Visit;
