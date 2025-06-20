const mongoose = require("mongoose");

const goldAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    goldRate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoldRate",
    },
    alertAmount: {
      type: Number,
      required: true,
    },
    alertStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);
const GoldAlert = mongoose.model("GoldAlert", goldAlertSchema);
module.exports = GoldAlert;
