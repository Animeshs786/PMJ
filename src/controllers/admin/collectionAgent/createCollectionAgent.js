const CollectionAgent = require("../../../models/collectionAgent");
const CollectionAgentMobile = require("../../../models/collectionAgentMobile");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createCollectionAgent = catchAsync(async (req, res, next) => {
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
  const registeredMobile = await CollectionAgentMobile.findOne({
    mobile: trimmedMobile,
  });
  if (!registeredMobile) {
    return next(new AppError("Your number is not registered.", 400));
  }

  // Check if the mobile number or email is already registered in CollectionAgent
  const existingAgentByMobile = await CollectionAgent.findOne({
    mobile: trimmedMobile,
  });
  const existingAgentByEmail = await CollectionAgent.findOne({ email });

  if (existingAgentByMobile) {
    return next(
      new AppError(
        "Collection agent with this mobile number already exists.",
        400
      )
    );
  }

  if (existingAgentByEmail) {
    return next(
      new AppError("Collection agent with this email already exists.", 400)
    );
  }

  // Create a new collection agent
  const newAgent = new CollectionAgent({
    name,
    email,
    mobile: trimmedMobile,
    location,
  });

  await newAgent.save();

  // Remove OTP from the response
  newAgent.otp = undefined;

  return res.status(201).json({
    status: true,
    message:
      "Collection agent registered successfully. OTP has been sent to the mobile number.",
    data: {
      mobile: newAgent.mobile,
      otpExpiry: newAgent.otpExpiry,
      agent: newAgent,
    },
  });
});
