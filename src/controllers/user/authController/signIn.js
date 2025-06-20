const axios = require("axios");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const generateOtp = require("../../../utils/generateOtp");
const User = require("../../../models/user");

exports.signIn = catchAsync(async (req, res, next) => {
  let { mobile } = req.body;
  let newUser = false;

  if (!mobile) throw new AppError("Mobile number is required.", 400);
  mobile = String(mobile).trim();

  if (
    isNaN(mobile) ||
    mobile.includes("e") ||
    mobile.includes(".") ||
    mobile.length > 10
  ) {
    return next(new AppError("Invalid mobile number.", 400));
  }

  let user = await User.findOne({ mobile });

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  const otp = generateOtp();

  async function send_otp(number, otp) {
    const options = {
      method: "POST",
      url: "https://api.msg91.com/api/v5/flow/",
      headers: {
        authkey: process.env.MSI_AUTH_KEY,
        "content-type": "application/JSON",
        Cookie: "PHPSESSID=p6sigj223tdkhtfnq7l41tplh3",
      },
      data: {
        flow_id: process.env.FLOW_ID,
        sender: "DILLIS",
        mobiles: "91" + number,
        otp: otp,
      },
    };
    try {
      await axios(options);
    } catch (error) {
      throw new Error(error);
    }
  }

  await send_otp(mobile, otp);
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  await user.save();
  user.otp = undefined;

  return res.status(200).json({
    status: true,
    message: "OTP has been sent",
    data: {
      mobile: user.mobile,
      otpExpiry: user.otpExpiry,
      user,
    },
    newUser,
  });
});
