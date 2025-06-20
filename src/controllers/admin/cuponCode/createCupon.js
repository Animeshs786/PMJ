const CuponCode = require("../../../models/cuponCode");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createCuponCode = catchAsync(async (req, res, next) => {
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


  if (!name) return next(new AppError("Name is required", 400));

  const existingCupon = await CuponCode.findOne({ name });
  if (existingCupon) {
    return next(new AppError("A coupon with this name already exists", 400));
  }

  if (!type) return next(new AppError("Type is required", 400));
  if (!value) return next(new AppError("Value is required", 400));
  const newCupon = await CuponCode.create({
    name,
    minOrderValue,
    maxDiscountValue,
    type,
    description,
    value,
    startDate,
    endDate,
    noOfTimes,
  });

  res.status(201).json({
    status: true,
    message: "Coupon created successfully",
    data: newCupon,
  });
});
