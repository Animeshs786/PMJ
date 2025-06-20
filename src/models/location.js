const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Location = mongoose.model("Location", locationSchema);
module.exports = Location;
