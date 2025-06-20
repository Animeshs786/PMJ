const Plan = require("../../../models/plan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updatePlan = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    validDeposit,
    advancePaymentNumber,
    commitedAmount,
  } = req.body;

  if (commitedAmount) {
    const user = await Plan.findOne({
      commitedAmount: commitedAmount,
      _id: { $ne: id },
    });
    if (user) {
      return next(new AppError("Amount already  exist already exists", 400));
    }
  }

  const updatedPlan = await Plan.findByIdAndUpdate(
    id,
    {
      name,
      validDeposit,
      advancePaymentNumber,
      commitedAmount,
    },
    { new: true, runValidators: true }
  );

  if (!updatedPlan) {
    return next(new AppError("No plan found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Plan updated successfully",
    data: {
      plan: updatedPlan,
    },
  });
});

