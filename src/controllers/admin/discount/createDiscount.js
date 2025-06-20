const Discount = require("../../../models/discount");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createDiscount = catchAsync(async (req, res, next) => {
  const { amount, discountValue } = req.body;

  if (!amount) {
    return next(new AppError("Please provide the amount", 400));
  }

  if (!discountValue) {
    return next(new AppError("Please provide the discount value", 400));
  }

  const discount = await Discount.create({ amount, discountValue });

  res.status(201).json({
    status: true,
    message: "Discount created successfully",
    data: {
      discount,
    },
  });
});
