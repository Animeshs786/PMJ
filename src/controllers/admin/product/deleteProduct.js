const { isValidObjectId } = require("mongoose");
const Product = require("../../../models/product");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.deleteProduct = catchAsync(async (req, res, next) => {
    const id = req.params.id;
  
    if (!isValidObjectId(id)) {
      return next(new AppError("Invalid product ID", 400));
    }
  
    const product = await Product.findById(id);
  
    if (!product) {
      return next(new AppError("Product not found", 404));
    }
  
    try {
      if (product.thumbImage) {
        await deleteOldFiles(product.thumbImage);
      }
  
      await Product.findByIdAndDelete(id);
  
      res.status(200).json({
        status: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      return next(error);
    }
  });