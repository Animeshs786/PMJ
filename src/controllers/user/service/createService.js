const Service = require("../../../models/service");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createService = catchAsync(async (req, res, next) => {
  const { name, mobileNumber, email, message } = req.body;

  if (!name || !mobileNumber || !email || !message) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const goldExchange = new Service({
    name,
    mobileNumber,
    email,
    message,
  });

  await goldExchange.save();

  res.status(201).json({
    status: true,
    message: "Visit request created successfully",
    data: {
      visit: goldExchange,
    },
  });
});
