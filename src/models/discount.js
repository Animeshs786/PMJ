const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Discount = mongoose.model("Discount", discountSchema);
module.exports = Discount;
