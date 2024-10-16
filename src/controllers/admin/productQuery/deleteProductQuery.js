const { isValidObjectId } = require("mongoose");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const ProductQuery = require("../../../models/productQuery");

exports.deleteProductQuery = catchAsync(async (req, res, next) => {
    const id = req.params.id;
  
    // Validate ID
    if (!isValidObjectId(id)) {
      return next(new AppError("Invalid product query ID", 400));
    }
  
    const productQuery = await ProductQuery.findByIdAndDelete(id);
  
    if (!productQuery) {
      return next(new AppError("Product query not found", 404));
    }
  
    res.status(200).json({
      status: true,
      message: "Product query deleted successfully",
    });
  });