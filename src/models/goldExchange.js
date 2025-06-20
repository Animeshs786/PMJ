const mongoose = require("mongoose");

const goldExchangeSchema = new mongoose.Schema({
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
  isView: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GoldExchange = mongoose.model("GoldExchange", goldExchangeSchema);
module.exports = GoldExchange;
