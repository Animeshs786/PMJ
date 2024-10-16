const Plan = require("../../../models/plan");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllPlans = catchAsync(async (req, res) => {
  const plans = await Plan.find().sort("-createdAt");

  res.status(200).json({
    status: true,
    message: "Plan fetched successfully.",
    data: {
      plans,
    },
  });
});
