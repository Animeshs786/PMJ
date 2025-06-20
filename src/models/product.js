const mongoose = require("mongoose");

const proudctSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  disclaimer: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  thumbImage: {
    type: String,
    required: true,
  },
  downloadContent: {
    type: String,
    default: "",
  },
  downloadImage: {
    type: String,
    default: "",
  },
  fileType:{
    type:String,
    default:"Video"
  },
  video:{
    type:String,
    defulat:""
  },
  catalogueImage: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", proudctSchema);
module.exports = Product;
