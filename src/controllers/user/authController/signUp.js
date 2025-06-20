const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const generateOtp = require("../../../utils/generateOtp");
const axios = require("axios");
const generateUniqueNumber = require("../../../utils/generateUniqueNumber");

exports.signUp = catchAsync(async (req, res, next) => {
  let { name, email, mobile, gender, dob, city, state, pincode, country } =
    req.body;

  if (!mobile) throw new AppError("Mobile number is required.", 400);
  if (!name) throw new AppError("Name is required.", 400);
  if (!gender) throw new AppError("Gender is required.", 400);
  if (!email) throw new AppError("Email is required.", 400);
  if (!city) throw new AppError("City is required.", 400);
  if (!state) throw new AppError("State is required.", 400);
  if (!pincode) throw new AppError("Pincode is required.", 400);
  if (!country) throw new AppError("Country is required.", 400);

  mobile = String(mobile).trim();
  email = email ? String(email).trim() : null;

  if (
    isNaN(mobile) ||
    mobile.includes("e") ||
    mobile.includes(".") ||
    mobile.length > 10
  ) {
    return next(new AppError("Invalid mobile number.", 400));
  }

  let user = await User.findOne({ mobile });
  let userEmail = await User.findOne({ email });

  if (userEmail) {
    return next(new AppError("User with this email already exists.", 400));
  }

  if (user) {
    return next(
      new AppError("User with this mobile number already exists.", 400)
    );
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
  const digitalAccount = generateUniqueNumber();

  user = new User({
    name,
    email,
    mobile,
    gender,
    dob,
    city,
    state,
    pincode,
    country,
    otp,
    otpExpiry,
    digitalAccount,
  });

  await user.save();
  user.otp = undefined;

  return res.status(201).json({
    status: true,
    message:
      "User registered successfully. OTP has been sent to the mobile number.",
    data: {
      mobile: user.mobile,
      otpExpiry: user.otpExpiry,
      user,
    },
    newUser: true,
  });
});
