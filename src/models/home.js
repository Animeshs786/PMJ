const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema({
  privacyPolicy: {
    type: String,
    default: "",
  },
  privacyPolicyDetails: {
    type: String,
    default: "",
  },
  termCondition: {
    type: String,
    default: "",
  },
  termConditionDetails: {
    type: String,
    default: "",
  },
  returnPolicy: {
    type: String,
    default: "",
  },
  returnPolicyDetails: {
    type: String,
    default: "",
  },
  aboutUs: {
    type: String,
    default: "",
  },
  aboutUsDetails: {
    type: String,
    default: "",
  },

  faq: [
    {
      question: String,
      answer: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Home = mongoose.model("Home", homeSchema);
module.exports = Home;
