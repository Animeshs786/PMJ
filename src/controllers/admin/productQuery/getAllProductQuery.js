const ProductQuery = require("../../../models/productQuery");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllProductQueries = catchAsync(async (req, res, ) => {
    const queries = await ProductQuery.find().populate("product");
  
    res.status(200).json({
      status: true,
      data: queries,
    });
  });