const mongoose = require("mongoose");

const shareSchema = new mongoose.Schema(
  {
    salePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalePerson",
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    mobile: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Share = mongoose.model("Share", shareSchema);
module.exports = Share;
