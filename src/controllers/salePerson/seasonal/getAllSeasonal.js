const Seasonal = require("../../../models/seasonal");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllSeasonal = catchAsync(async (req, res) => {
  const exhibitions = await Seasonal.find({
    isActive: true,
  }).sort("-createdAt");

  res.status(200).json({
    status: true,
    message: "Seasonals fetched successfully",
    data: exhibitions,
  });
});