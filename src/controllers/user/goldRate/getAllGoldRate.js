const GoldRate = require("../../../models/goldRate");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllGoldRates = catchAsync(async (req, res) => {
  const goldRates = await GoldRate.find();

  res.status(200).json({
    status: true,
    results: goldRates.length,
    message: "Gold Rates fetched successfully",
    data: {
      goldRates,
    },
  });
});

