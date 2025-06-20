const ProductQuery = require("../../../models/productQuery");
const Product = require("../../../models/product");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const { isValidObjectId } = require("mongoose");

// Create a new product query
exports.createProductQuery = catchAsync(async (req, res, next) => {
  const { name, email, mobileNumber, state, city, product,message } = req.body;

  // Check if product ID is valid
  if (!isValidObjectId(product)) {
    return next(new AppError("Invalid product ID", 400));
  }

  // Check if the product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    return next(new AppError("Product not found", 404));
  }

  // Create and save the product query
  const newProductQuery = await ProductQuery.create({
    name,
    email,
    mobileNumber,
    state,
    city,
    product,
    message
  });

  res.status(201).json({
    status: true,
    message: "Product query created successfully",
    data: newProductQuery,
  });
});
