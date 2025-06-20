const Plan = require("../../../models/plan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deletePlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedPlan = await Plan.findByIdAndDelete(id);

  if (!deletedPlan) {
    return next(new AppError("No plan found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Plan deleted successfully",
  });
});
