const mongoose = require("mongoose");

const userPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  planStartDate: {
    type: Date,
    required: true,
  },
  planEndDate: {
    type: Date,
    required: true,
  },
  maturityDate: {
    type: Date,
    required: true,
  },
  initialDiscount: {
    type: Number,
    required: true,
  },
  rewardAmount: {
    type: Number,
    required: true,
  },
  amountAfterDiscount: {
    type: Number,
    required: true,
  },
  advancePaid: {
    type: Number,
    required: true,
  },
  overAllBenefits: {
    type: Number,
    required: true,
  },
  redemptionValue: {
    type: Number,
    required: true,
  },
  advancePaymentNumber: {
    type: Number,
    required: true,
  },
  commitedAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Initiated", "Active", "Completed"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const UserPlan = mongoose.model("UserPlan", userPlanSchema);
module.exports = UserPlan;
