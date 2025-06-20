const catchAsync = require("../../../utils/catchAsync");
const Product = require("../../../models/product");

exports.getAllProducts = catchAsync(async (req, res) => {
  const product = await Product.find().select("thumbImage name");

  res.status(200).json({
    status: true,
    message: "Product fetched successfully",
    data: product,
  });
});
