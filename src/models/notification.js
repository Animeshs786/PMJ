const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    default: " ",
  },
  type: {
    type: String,
    enum: ["birthday", "goldAlert", "aniversary", "seasonal", "exhibition", "other"],
    required: true,
  },
  file: {
    type: String,
    default: "",
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
