const Location = require("../../../models/location");
const State = require("../../../models/state");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const createLocation = catchAsync(async (req, res, next) => {
  const { name, state } = req.body;

  // Check if location already exists
  const existingLocation = await Location.findOne({ name });
  if (existingLocation) {
    return next(new AppError("Location already exists.", 400));
  }

  // Check if state exists
  const stateExists = await State.findById(state);
  if (!stateExists) {
    return next(new AppError("State not found.", 404));
  }

  const location = await Location.create({ name, state });

  res.status(201).json({
    status: true,
    message: "Location created successfully.",
    data: location,
  });
});

module.exports = createLocation;
