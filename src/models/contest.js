const mongoose = require("mongoose");

const contestSchema = new mongoose.Schema({
  file: [
    {
      type: String,
      required: true,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Contest = mongoose.model("Contest", contestSchema);
module.exports = Contest;
