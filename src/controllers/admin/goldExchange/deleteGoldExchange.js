const GoldExchange = require("../../../models/goldExchange");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteGoldExchange = catchAsync(async (req, res, next) => {
  const goldExchange = await GoldExchange.findByIdAndDelete(req.params.id);

  if (!goldExchange) {
    return next(
      new AppError("No gold exchange request found with that ID", 404)
    );
  }

  res.status(200).json({
    status: true,
    message: "Gold exchange request deleted successfully",
  });
});
