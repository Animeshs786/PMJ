const mongoose = require("mongoose");

const denominationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  userPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserPlan",
  },
  collectionAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CollectionAgent",
  },
  emiNumber: {
    type: Number,
    required: true,
  },
  tenRupeesQty: {
    type: Number,
    default: 0,
  },
  twentyRupeesQty: {
    type: Number,
    default: 0,
  },
  fiftyRupeesQty: {
    type: Number,
    default: 0,
  },
  hundredRupeesQty: {
    type: Number,
    default: 0,
  },
  twoHundredRupeesQty: {
    type: Number,
    default: 0,
  },
  fiveHundredRupeesQty: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Denomination = mongoose.model("Denomination", denominationSchema);
module.exports = Denomination;
