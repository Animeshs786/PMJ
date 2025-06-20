const Exhibition = require("../../../models/exhibition");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllExhibitions = catchAsync(async (req, res) => {
  const exhibitions = await Exhibition.find({
    isActive: true,
  }).sort("-createdAt");

  res.status(200).json({
    status: true,
    message: "Exhibitions fetched successfully",
    data: exhibitions,
  });
});
