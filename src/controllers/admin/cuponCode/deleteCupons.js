const CuponCode = require("../../../models/cuponCode");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteCupon = catchAsync(async (req, res, next) => {
  const goldExchange = await CuponCode.findByIdAndDelete(req.params.id);

  if (!goldExchange) {
    return next(new AppError("No Cupon request found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Cupon request deleted successfully",
  });
});
