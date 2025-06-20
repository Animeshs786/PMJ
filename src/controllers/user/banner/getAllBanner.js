const Banner = require("../../../models/banner");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllBanners = catchAsync(async (req, res) => {
  const banners = await Banner.find()
    .populate({
      path: "productId", // The field to populate
      select: "name", // Include only the name field from the Product model
    })
    .sort({ priority: 1 });

  res.status(200).json({
    status: true,
    message: "Banners fetched successfully.",
    data: {
      banners,
    },
  });
});
