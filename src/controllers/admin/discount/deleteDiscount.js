const Discount = require("../../../models/discount");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteDiscount = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const discount = await Discount.findByIdAndDelete(id);
  
    if (!discount) {
      return next(new AppError("No discount found with this ID", 404));
    }
  
    res.status(200).json({
      status: true,
      message: "Discount deleted successfully",
    });
  });
  