const express = require("express");
const { signUp } = require("../controllers/mentor/authController/signUp");
const { otpVerify } = require("../controllers/mentor/authController/otpVerify");
const {
  metntorAuthenticate,
} = require("../controllers/mentor/authController/mentorAuthenticate");
const {
  updateProfile,
} = require("../controllers/mentor/authController/updateProfile");
const fileUploader = require("../middleware/fileUploader");

const router = express.Router();

//Authentication
router.post("/signUp", signUp);
router.post("/verifyOtp", otpVerify);
router.patch(
  "/updateProfile",
  metntorAuthenticate,
  fileUploader([{ name: "profileImage", maxCount: 1 }], "mentor"),
  updateProfile
);

module.exports = router;
