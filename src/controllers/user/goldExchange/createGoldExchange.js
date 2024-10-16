const GoldExchange = require("../../../models/goldExchange");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createGoldExchange = catchAsync(async (req, res, next) => {
  const { name, mobileNumber, email, message } = req.body;

  if (!name || !mobileNumber || !email || !message) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const goldExchange = new GoldExchange({
    name,
    mobileNumber,
    email,
    message,
  });

  await goldExchange.save();

  res.status(201).json({
    status: true,
    message: "Gold exchange request created successfully",
    data: {
      goldExchange,
    },
  });
});
