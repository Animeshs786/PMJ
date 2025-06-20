const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const generateUniqueNumber = require("../../../utils/generateUniqueNumber");

exports.createUser = catchAsync(async (req, res, next) => {
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
    otpExpiry,
    digitalAccount,
  });

  await user.save();
  user.otp = undefined;

  return res.status(201).json({
    status: true,
    message: "User registered successfully.",
    data: {
      user,
    },
  });
});
