const Contest = require("../../../models/contest");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllContest = catchAsync(async (req, res) => {
  const exhibitions = await Contest.find({
    isActive: true,
  }).sort("-createdAt");

  res.status(200).json({
    status: true,
    message: "Contests fetched successfully",
    data: exhibitions,
  });
});
