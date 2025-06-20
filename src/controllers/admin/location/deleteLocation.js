const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const Location = require("../../../models/location");

const deleteLocation = catchAsync(async (req, res, next) => {
  const locationId = req.params.id;

  const location = await Location.findByIdAndDelete(locationId);
  if (!location) {
    return next(new AppError("Location not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "Location deleted successfully.",
  });
});

module.exports = deleteLocation;