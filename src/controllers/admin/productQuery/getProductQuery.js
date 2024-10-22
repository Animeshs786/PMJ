const { isValidObjectId } = require("mongoose");
const catchAsync = require("../../../utils/catchAsync");
const ProductQuery = require("../../../models/productQuery");
const AppError = require("../../../utils/AppError");

exports.getProductQuery = catchAsync(async (req, res, next) => {
    const id = req.params.id;
  
    // Check if product query ID is valid
    if (!isValidObjectId(id)) {
      return next(new AppError("Invalid product query ID", 400));
    }
  
    const productQuery = await ProductQuery.findById(id);
  
    if (!productQuery) {
      return next(new AppError("Product query not found", 404));
    }
  
    res.status(200).json({
      status: true,
      data: productQuery,
    });
  });