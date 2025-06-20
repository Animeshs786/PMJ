const { isValidObjectId } = require("mongoose");
const Product = require("../../../models/product");
const ProductQuery = require("../../../models/productQuery");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateProductQuery = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const { name, email, mobileNumber, state, city, status, product } = req.body;
  const updateData = {};

  // Validate ID
  if (!isValidObjectId(id)) {
    return next(new AppError("Invalid product query ID", 400));
  }

  // Update fields if provided
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (mobileNumber) updateData.mobileNumber = mobileNumber;
  if (state) updateData.state = state;
  if (city) updateData.city = city;
  if (status) {
    updateData.status = status;
    updateData.updatedAt = new Date();
  }
  if (product) {
    if (!isValidObjectId(product)) {
      return next(new AppError("Invalid product ID", 400));
    }

    const productExists = await Product.findById(product);
    if (!productExists) {
      return next(new AppError("Product not found", 404));
    }
    updateData.product = product;
  }

  // Update the product query
  const updatedProductQuery = await ProductQuery.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate("product");

  if (!updatedProductQuery) {
    return next(new AppError("Product query not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Product query updated successfully",
    data: updatedProductQuery,
  });
});
