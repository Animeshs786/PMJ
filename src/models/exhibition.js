const mongoose = require("mongoose");

const exhibitionSchema = new mongoose.Schema({
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

const Exhibition = mongoose.model("Exhibition", exhibitionSchema);
module.exports = Exhibition;
