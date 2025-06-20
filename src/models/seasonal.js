const mongoose = require("mongoose");

const seasonalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Seasonal = mongoose.model("Seasonal", seasonalSchema);
module.exports = Seasonal;
