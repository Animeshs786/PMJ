const Plan = require("../../../models/plan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updatePlan = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, validDeposit, discounts, advancePaymentNumber } = req.body;
  
    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      {
        name,
        validDeposit,
        discounts,
        advancePaymentNumber,
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