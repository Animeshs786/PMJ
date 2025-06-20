const mongoose = require("mongoose");

const cashierSchema = new mongoose.Schema({
  name: String,
  agentId: {
    type: String,
    trime: true,
  },
  mobile: {
    type: String,
    trim: true,
    required: true,
  },
  email: String,
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Cashier = mongoose.model("Cashier", cashierSchema);
module.exports = Cashier;
