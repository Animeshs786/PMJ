const mongoose = require("mongoose");

const cuponCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  minOrderValue: {
    type: Number,
  },
  maxDiscountValue: {
    type: Number,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  noOfTimes: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const CuponCode = mongoose.model("CuponCode", cuponCodeSchema);
module.exports = CuponCode;
