const Discount = require("../../../models/discount");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateDiscount = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { amount, discountValue } = req.body;

  const discount = await Discount.findByIdAndUpdate(
    id,
    { amount, discountValue: discountValue },
    { new: true, runValidators: true }
  );

  if (!discount) {
    return next(new AppError("No discount found with this ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Discount updated successfully",
    data: {
      discount,
    },
  });
});
