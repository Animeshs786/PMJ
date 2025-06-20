const mongoose = require("mongoose");

const collectionAgentTargetSchema = new mongoose.Schema({
  collectionAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CollectionAgent",
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

const CollectionAgentTarget = mongoose.model(
  "CollectionAgentTarget",
  collectionAgentTargetSchema
);
module.exports = CollectionAgentTarget;
