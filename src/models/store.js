const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  fullAddress: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
  },
  openTime: {
    type: String,
    required: true,
  },
  closeTime: {
    type: String,
    required: true,
  },
  image: [String],
  lat: {
    type: String,
    required: true,
  },
  lng: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;
