const Plan = require("../../../models/plan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createPlan = catchAsync(async (req, res, next) => {
  const { name, validDeposit, discounts, advancePaymentNumber } = req.body;

  if (!name || !validDeposit || !advancePaymentNumber) {
    return next(new AppError("Please provide all required fields", 400));
  }

  const plan = new Plan({
    name,
    validDeposit,
    discounts,
    advancePaymentNumber,
  });

  await plan.save();

  res.status(201).json({
    status: true,
    message: "Plan created successfully",
    data: {
      plan,
    },
  });
});
