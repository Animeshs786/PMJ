const GoldRate = require("../../../models/goldRate");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createGoldRate = catchAsync(async (req, res, next) => {
  const { goldRate, carret, currencyType } = req.body;

  if (!goldRate || !carret) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const goldRateData = new GoldRate({
    goldRate,
    carret,
    currencyType,
    lastUpdateAt: Date.now(),
  });

  await goldRateData.save();

  res.status(201).json({
    status: true,
    message: "Gold rate created successfully",
    data: {
      goldRateData,
    },
  });
});
