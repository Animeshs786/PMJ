const mongoose = require("mongoose");

const collectionAgentSchema = new mongoose.Schema({
  name: String,
  agentId: {
    type: String,
    trime: true,
  },
  mobile: {
    type: String,
    trim: true,
    required: true,
  },
  email: String,
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CollectionAgent = mongoose.model(
  "CollectionAgent",
  collectionAgentSchema
);
module.exports = CollectionAgent;
