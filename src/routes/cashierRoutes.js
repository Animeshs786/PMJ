const express = require("express");
const { signUp } = require("../controllers/cashier/authController/signUp");
const { signIn } = require("../controllers/cashier/authController/signIn");
const {
  otpVerify,
} = require("../controllers/cashier/authController/otpVerify");
const {
  CashierAuthenticate,
} = require("../controllers/cashier/authController/cashierAgentAuthenticate");
const router = express.Router();

//Authentication
router.post("/register", signUp);
router.post("/signIn", signIn);
router.post("/verifyOtp", otpVerify);

router.use(CashierAuthenticate);

module.exports = router;
