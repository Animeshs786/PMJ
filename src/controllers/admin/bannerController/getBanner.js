const Banner = require("../../../models/banner");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getBanner = catchAsync(async (req, res, next) => {
    const banner = await Banner.findById(req.params.id);
  
    if (!banner) {
      return next(new AppError("No banner found with that ID", 404));
    }
  
    res.status(200).json({
      status: true,
      data: {
        banner,
      },
    });
  });
  