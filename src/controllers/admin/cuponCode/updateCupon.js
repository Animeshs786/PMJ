const CuponCode = require("../../../models/cuponCode");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateCuponCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    minOrderValue,
    maxDiscountValue,
    type,
    description,
    value,
    startDate,
    endDate,
    noOfTimes,
  } = req.body;
  const obj = {};

  const existingCupon = await CuponCode.findOne({ name, _id: { $ne: id } });
  if (existingCupon) {
    return next(new AppError("A coupon with this name already exists", 400));
  }
  if (name) obj.name = name;
  if (minOrderValue) obj.minOrderValue = minOrderValue;
  if (maxDiscountValue) obj.maxDiscountValue = maxDiscountValue;
  if (type) obj.type = type;
  if (description) obj.description = description;
  if (value) obj.value = value;
  if (startDate) obj.startDate = startDate;
  if (endDate) obj.endDate = endDate;
  if (noOfTimes) obj.noOfTimes = noOfTimes;

  const updatedCupon = await CuponCode.findByIdAndUpdate(id, obj, {
    new: true,
    runValidators: true,
  });

  if (!updatedCupon) {
    return next(new AppError("Coupon not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Coupon updated successfully",
    data: updatedCupon,
  });
});
