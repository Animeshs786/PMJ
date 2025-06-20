const mongoose = require("mongoose");

const collectionAgentMobileSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const CollectionAgentMobile = mongoose.model(
  "CollectionAgentMobile",
  collectionAgentMobileSchema
);
module.exports = CollectionAgentMobile;
