const GoldRate = require("../../../models/goldRate");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteGoldRate = catchAsync(async (req, res, next) => {
  const goldRate = await GoldRate.findByIdAndDelete(req.params.id);

  if (!goldRate) {
    return next(new AppError("No gold rate found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Gold rate deleted successfully",
  });
});
