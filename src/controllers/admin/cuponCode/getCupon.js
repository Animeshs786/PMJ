const CuponCode = require("../../../models/cuponCode");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getCuponCodeById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const cupon = await CuponCode.findById(id);

  if (!cupon) {
    return next(new AppError("Coupon not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Coupon retrieved successfully",
    data: cupon,
  });
});
