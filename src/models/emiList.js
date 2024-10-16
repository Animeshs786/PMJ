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
        enum: ["Pending", "Paid", "Bonus"],
        default: "Pending",
      },
      dueDate: Date,
      paidDate: {
        type: Date,
        default: null,
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
