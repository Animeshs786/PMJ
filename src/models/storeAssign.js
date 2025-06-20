const mongoose = require("mongoose");

const storeAssignSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  salePerson: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalePerson",
      required: true,
    },
  ],
  collectionAgent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollectionAgent",
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const StoreAssign = mongoose.model("StoreAssign", storeAssignSchema);
module.exports = StoreAssign;
