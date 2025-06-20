const State = require("../../../models/state");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const deleteState = catchAsync(async (req, res, next) => {
  const stateId = req.params.id;

  const state = await State.findByIdAndDelete(stateId);
  if (!state) {
    return next(new AppError("State not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "State deleted successfully.",
  });
});

module.exports = deleteState;