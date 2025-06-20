const Plan = require("../../../models/plan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createPlan = catchAsync(async (req, res, next) => {
  const {
    name,
    validDeposit,
    advancePaymentNumber,
    commitedAmount,
  } = req.body;

  if (!name || !validDeposit || !advancePaymentNumber || !commitedAmount) {
    return next(new AppError("Please provide all required fields", 400));
  }

  if (commitedAmount) {
    const user = await Plan.findOne({
      commitedAmount: commitedAmount,
    });
    if (user) {
      return next(new AppError("Amount already  exist already exists", 400));
    }
  }

  const plan = new Plan({
    name,
    validDeposit,
    advancePaymentNumber,
    commitedAmount,
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
