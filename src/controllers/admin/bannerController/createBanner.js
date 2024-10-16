const Banner = require("../../../models/banner");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.createBanner = catchAsync(async (req, res, next) => {
  const { redirectPath, priority, redirectType } = req.body;
  let image = "";

  if (req.files && req.files.image) {
    image = `${req.files.image[0].destination}/${req.files.image[0].filename}`;
  } else {
    return next(new AppError("Image is required", 400));
  }
  const newBanner = await Banner.create({
    image,
    redirectPath,
    priority,
    redirectType,
  });

  // Respond with the created banner
  res.status(201).json({
    status: true,
    data: {
      banner: newBanner,
    },
  });
});
