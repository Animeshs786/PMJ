const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const Location = require("../../../models/location");

const getLocationById = catchAsync(async (req, res, next) => {
  const locationId = req.params.id;

  const location = await Location.findById(locationId).populate("state", "name");
  if (!location) {
    return next(new AppError("Location not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "Location fetched successfully.",
    data: location,
  });
});

module.exports = getLocationById;