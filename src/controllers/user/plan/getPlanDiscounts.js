const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");

exports.getPlanDiscounts = catchAsync(async (req, res) => {
  const { userPlan } = req.body;
  const plans = await UserPlan.findById(userPlan)
    .populate("plan", "name discounts")
    .select("commitedAmount initialDiscount amountAfterDiscount");

  const { commitedAmount } = plans;
  const discounts = plans.plan.discounts;

  const updatedDiscounts = discounts.map((discount) => {
    return {
      ...discount.toObject(),
      isApplied: commitedAmount >= discount.amount
    };
  });

  res.status(200).json({
    status: true,
    message: "Plan fetched successfully.",
    data: {
      plans: {
        ...plans.toObject(),
        plan: {
          ...plans.plan.toObject(),
          discounts: updatedDiscounts
        }
      }
    }
  });
});
