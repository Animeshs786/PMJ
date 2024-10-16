const mongoose = require("mongoose");

const planScheama = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  validDeposit: {
    type: Number,
    required: true,
  },
  discounts: [
    {
      amount: {
        type: Number,
        required: true,
      },
      discountValue: {
        type: Number,
        required: true,
      },
    },
  ],
  advancePaymentNumber: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Plan = mongoose.model("Plan", planScheama);
module.exports = Plan;