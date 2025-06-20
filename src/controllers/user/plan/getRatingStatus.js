const Rating = require("../../../models/ratting");
const catchAsync = require("../../../utils/catchAsync");

exports.getRatingStatus = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  let status = false;

  const newRating = await Rating.findOne({
    user: userId,
  });

  if (newRating) {
    status = true;
  }

  res.status(201).json({
    status: true,
    message: "Rating created successfully",
    isRated: status,
  });
});
