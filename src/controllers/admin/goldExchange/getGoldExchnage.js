const GoldExchange = require("../../../models/goldExchange");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getGoldExchange = catchAsync(async (req, res, next) => {
  const goldExchange = await GoldExchange.findById(req.params.id);

  if (!goldExchange) {
    return next(
      new AppError("No gold exchange request found with that ID", 404)
    );
  }

  res.status(200).json({
    status: true,
    data: {
      goldExchange,
    },
  });
});