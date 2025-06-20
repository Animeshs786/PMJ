const State = require("../../../models/state");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const updateState = catchAsync(async (req, res, next) => {
  const stateId = req.params.id;
  const { name } = req.body;

  const state = await State.findByIdAndUpdate(
    stateId,
    { name },
    { new: true, runValidators: true }
  );

  if (!state) {
    return next(new AppError("State not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "State updated successfully.",
    data: state,
  });
});

module.exports = updateState;