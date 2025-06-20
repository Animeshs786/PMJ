const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema({
  salePerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalePerson",
    required: true,
  },
  target: {
    type: Number,
    default: 0,
  },
  month: {
    type: Number,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Target = mongoose.model("Target", targetSchema);
module.exports = Target;
