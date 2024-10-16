const Banner = require("../../../models/banner");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.deleteBanner = catchAsync(async (req, res, next) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError("No banner found with that ID", 404));
  }

  if (banner.image) {
    await deleteOldFiles(banner.image).catch((err) => {
      console.error("Failed to delete image", err);
    });
  }

  await Banner.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: true,
    message: "Banner deleted successfully",
    data: null,
  });
});
