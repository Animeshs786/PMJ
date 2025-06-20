const Cashier = require("../../../models/cashier");
const CashierMobile = require("../../../models/cashierMobile");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const generateOtp = require("../../../utils/generateOtp");
const axios = require("axios");

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, mobile, location } = req.body;

  // Validate required fields
  if (!mobile) throw new AppError("Mobile number is required.", 400);
  if (!name) throw new AppError("Name is required.", 400);
  if (!email) throw new AppError("Email is required.", 400);
  if (!location) throw new AppError("Location is required.", 400);

  // Trim and validate mobile number
  const trimmedMobile = String(mobile).trim();
  if (
    isNaN(trimmedMobile) ||
    trimmedMobile.includes("e") ||
    trimmedMobile.includes(".") ||
    trimmedMobile.length > 10
  ) {
    return next(new AppError("Invalid mobile number.", 400));
  }

  // Check if the mobile number is registered in CollectionAgentMobile
  const registeredMobile = await CashierMobile.findOne({
    mobile: trimmedMobile,
  });
  if (!registeredMobile) {
    return next(new AppError("Your number is not registered.", 400));
  }

  // Check if the mobile number or email is already registered in CollectionAgent
  const existingAgentByMobile = await Cashier.findOne({
    mobile: trimmedMobile,
  });
  const existingAgentByEmail = await Cashier.findOne({ email });

  if (existingAgentByMobile) {
    return next(
      new AppError("Cashier with this mobile number already exists.", 400)
    );
  }

  if (existingAgentByEmail) {
    return next(new AppError("Cashier with this email already exists.", 400));
  }

  const otp = generateOtp();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

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

  await send_otp(trimmedMobile, otp);

  // Create a new collection agent
  const newAgent = new Cashier({
    name,
    email,
    mobile: trimmedMobile,
    location,
    otp,
    otpExpiry,
  });

  await newAgent.save();

  // Remove OTP from the response
  newAgent.otp = undefined;

  return res.status(201).json({
    status: true,
    message:
      "Cashier registered successfully. OTP has been sent to the mobile number.",
    data: {
      mobile: newAgent.mobile,
      otpExpiry: newAgent.otpExpiry,
      agent: newAgent,
    },
  });
});
