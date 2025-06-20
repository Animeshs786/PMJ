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
  pincode: {
    type: Number,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Store = mongoose.model("Store", storeSchema);
module.exports = Store;
