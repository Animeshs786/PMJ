
const Visit = require("../../../models/visit");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteVisit = catchAsync(async (req, res, next) => {
  const goldExchange = await Visit.findByIdAndDelete(req.params.id);

  if (!goldExchange) {
    return next(
      new AppError("No Visit request found with that ID", 404)
    );
  }

  res.status(200).json({
    status: true,
    message: "Visit request deleted successfully",
  });
});
