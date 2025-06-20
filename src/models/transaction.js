const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Success", "Failed", "Pending"],
    default: "Pending",
  },
  userPlan:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserPlan",
    required: true,
  },
  checqueImage:{
    type:String,
    default:""
  },
  paymentType:{
    type:String,
    enum:["Online","Offline","Cheque"],
    default:"Online"
  },
  orderId: {
    type: String,
    default: "",
  },
  transactionId: {
    type: String,
    default: "",
  },
  remark:{
    type:String,
    default:""
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
