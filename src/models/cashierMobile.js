const mongoose = require("mongoose");

const cashierSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const CashierMobile = mongoose.model("CashierMobile", cashierSchema);
module.exports = CashierMobile;
