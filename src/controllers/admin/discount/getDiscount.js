const Discount = require("../../../models/discount");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getDiscount = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const discount = await Discount.findById(id);
  
    if (!discount) {
      return next(new AppError("No discount found with this ID", 404));
    }
  
    res.status(200).json({
      status: true,
      message: "Discount retrieved successfully",
      data: {
        discount,
      },
    });
  });
  