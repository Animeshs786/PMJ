const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String },
  mobile: String,
  otp: {
    type: String,
    select: false,
  },
  otpExpiry: Date,
  profileImage: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  digitalAccount: {
    type: String,
    default: "",
    trim: true,
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
  refferalCode: {
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
  fcmToken: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
