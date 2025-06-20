const Service = require("../../../models/service");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteService = catchAsync(async (req, res, next) => {
  const goldExchange = await Service.findByIdAndDelete(req.params.id);

  if (!goldExchange) {
    return next(new AppError("No Service request found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Service request deleted successfully",
  });
});
