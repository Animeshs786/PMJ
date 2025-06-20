const mongoose = require("mongoose");

const planDockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
  },
  name: String,
  email: { type: String },
  mobile: String,
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  dob: {
    type: String,
    default: "",
  },
  city: {
    type: String,
    default: "",
  },
  state: {
    type: String,
    default: "",
  },
  pincode: {
    type: String,
    default: "",
  },
  country: {
    type: String,
    default: "",
  },
  nomineeName: {
    type: String,
    default: "",
  },
  nomineeRelation: {
    type: String,
    default: "",
  },
  salePersonId: {
    type: String,
    default: "",
  },
  panImage: [String],
  adharImage: [String],
  bankName: {
    type: String,
    default: "",
  },
  ifscCode: {
    type: String,
    default: "",
  },
  branchName: {
    type: String,
    default: "",
  },
  accountNumber: {
    type: String,
    default: "",
  },
  customerName: {
    type: String,
    default: "",
  },
  billingAddress1: {
    type: String,
    default: "",
  },
  billingAddress2: {
    type: String,
    default: "",
  },
  billingPincode: {
    type: String,
    default: "",
  },
  billingCountry: {
    type: String,
    default: "",
  },
  billingState: {
    type: String,
    default: "",
  },
  billingCity: {
    type: String,
    default: "",
  },
  shippingAddress1: {
    type: String,
    default: "",
  },
  shippingAddress2: {
    type: String,
    default: "",
  },
  shippingPincode: {
    type: String,
    default: "",
  },
  shippingCountry: {
    type: String,
    default: "",
  },
  shippingState: {
    type: String,
    default: "",
  },
  shippingCity: {
    type: String,
    default: "",
  },
  panId:{
    type:String,
    default:""
  },
  gurdianProofImage: [String],
  maritalStatus: {
    type: String,
    enum: ["Single", "Married"],
    default: "Single",
  },
  aniversaryDate: {
    type: String,
    default: "",
  },
  schemeCustomer: {
    type: String,
    default: "",
  },
  citizenship: {
    type: String,
    default: "",
  },
  lat: {
    type: String,
    default: "",
  },
  lng: {
    type: String,
    default: "",
  },
  governmentIdProofImage: [String],
  form60Image: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PlanDock = mongoose.model("PlanDock", planDockSchema);
module.exports = PlanDock;

