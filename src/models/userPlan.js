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
  salePersonId: {
    type: String,
    default: " ", //stoer saleperson user name
  },
  planDock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PlanDock",
    required: true,
  },
  cupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CuponCode",
  },
  cuponValue: {
    type: Number,
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
  firstDiscount: {
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
  completeDate: {
    type: Date,
  },
  forclosedDate: {
    type: Date,
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
    enum: ["Initiated", "Active", "Completed","Forclosed"],
  },
  remark:String,
  isRedem: {
    type: Boolean,
    default: false,
  },
  redemptionDate: {
    type: Date,
  },
  isRedeemedView: {
    type: Boolean,
    default: false,
  },
  isPendingRedeemView: {
    type: Boolean,
    default: false,
  },
  isUpcomingMaturityView: {
    type: Boolean,
    default: false,
  },
  isRenrollAllView: {
    type: Boolean,
    default: false,
  },
  isRepeatPurchaseView: {
    type: Boolean,
    default: false,
  },
  isSinglePurchaseView: {
    type: Boolean,
    default: false,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  digitalAccount: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const UserPlan = mongoose.model("UserPlan", userPlanSchema);
module.exports = UserPlan;
