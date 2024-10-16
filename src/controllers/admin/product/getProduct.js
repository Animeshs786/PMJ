const { isValidObjectId } = require("mongoose");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Product = require("../../../models/product");

exports.getProduct = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return next(new AppError("Invalid product ID", 400));
  }

  const product = await Product.findById(id);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.status(200).json({
    status: true,
    data: product,
  });
});
