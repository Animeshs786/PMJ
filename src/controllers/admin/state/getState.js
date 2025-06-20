const State = require("../../../models/state");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const getStateById = catchAsync(async (req, res, next) => {
  const stateId = req.params.id;

  const state = await State.findById(stateId);
  if (!state) {
    return next(new AppError("State not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "State fetched successfully.",
    data: state,
  });
});

module.exports = getStateById;
