const Service = require("../../../models/service");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getService = catchAsync(async (req, res, next) => {
  const goldExchange = await Service.findById(req.params.id);

  if (!goldExchange) {
    return next(new AppError("No service  request found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    data: {
      service: goldExchange,
    },
  });
});
