const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  image: String,
  redirectPath: {
    type: String,
    default: "",
  },
  redirectType: {
    type: String,
    default: "Internal",
    enum: ["Internal", "External"],
  },
  priority: {
    type: Number,
    default: 0,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // Reference to the Product model
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Banner = mongoose.model("Banner", bannerSchema);
module.exports = Banner;
