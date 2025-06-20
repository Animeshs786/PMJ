const mongoose = require("mongoose");

const goldRateSchema = new mongoose.Schema({
  goldRate: {
    type: Number,
    required: true,
  },
  carret: {
    type: Number,
    required: true,
  },
  currencyType: {
    type: String,
    default: "INR",
  },
  lastUpdateAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GoldRate = mongoose.model("GoldRate", goldRateSchema);
module.exports = GoldRate;
