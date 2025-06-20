const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const Location = require("../../../models/location");
const State = require("../../../models/state");

const updateLocation = catchAsync(async (req, res, next) => {
  const locationId = req.params.id;
  const { name, state } = req.body;

  // Check if state exists (if state is being updated)
  if (state) {
    const stateExists = await State.findById(state);
    if (!stateExists) {
      return next(new AppError("State not found.", 404));
    }
  }

  const location = await Location.findByIdAndUpdate(
    locationId,
    { name, state },
    { new: true, runValidators: true }
  );

  if (!location) {
    return next(new AppError("Location not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "Location updated successfully.",
    data: location,
  });
});

module.exports = updateLocation;