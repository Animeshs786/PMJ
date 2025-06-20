const mongoose = require("mongoose");

const userAssignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  collectionAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CollectionAgent",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserAssign = mongoose.model("UserAssign", userAssignSchema);
module.exports = UserAssign;