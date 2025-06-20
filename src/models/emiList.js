const mongoose = require("mongoose");

const emiListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserPlan",
    required: true,
  },
  emiList: [
    {
      month: Number,
      monthlyAdvance: Number,
      status: {
        type: String,
        enum: ["Pending", "Paid", "Bonus", "Fail"],
        default: "Pending",
      },
      dueDate: Date,
      paidDate: {
        type: Date,
        default: null,
      },
      invoice: {
        type: String,
        default: "",
      },
      transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
      denomination: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Denomination",
      },
      adminVerify: {
        type: Boolean,
        default: false,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const EmiList = mongoose.model("EmiList", emiListSchema);
module.exports = EmiList;
