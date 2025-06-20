const Banner = require("../../../models/banner");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.updateBanner = catchAsync(async (req, res, next) => {
  const { redirectPath, priority, redirectType, productId } = req.body;
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    return next(new AppError("No banner found with that ID", 404));
  }

  let image = banner.image;
  let webImage = banner.webImage;

  if (req.files && req.files.image) {
    image = `${req.files.image[0].destination}/${req.files.image[0].filename}`;

    if (banner.image) {
      await deleteOldFiles([banner.image]).catch((err) => {
        console.error("Failed to delete old image", err);
      });
    }
  }

  if (req.files && req.files.webImage) {
    webImage = `${req.files.webImage[0].destination}/${req.files.webImage[0].filename}`;

    if (banner.webImage) {
      await deleteOldFiles([banner.webImage]).catch((err) => {
        console.error("Failed to delete old webImage", err);
      });
    }
  }

  const updatedData = {};

  if (image) updatedData.image = image;
  if (webImage) updatedData.webImage = webImage;
  if (priority) updatedData.priority = priority;
  if (redirectType) updatedData.redirectType = redirectType;
  if (redirectPath) updatedData.redirectPath = redirectPath;
  if (productId) updatedData.productId = productId;

  const existingProductId = await Banner.findOne({
    productId,
    _id: { $ne: req.params.id },
  });

  if (existingProductId) {
    return next(new AppError("Product Id already exists", 400));
  }

  const updatedBanner = await Banner.findByIdAndUpdate(
    req.params.id,
    updatedData,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: true,
    message: "Banner updated successfully",
    data: {
      banner: updatedBanner,
    },
  });
});
