const Discount = require("../../../models/discount");
const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");

exports.getPlanDiscounts = catchAsync(async (req, res) => {
  const { userPlan } = req.body;
  const plans = await UserPlan.findById(userPlan)
    .populate("plan", "name discounts")
    .select("commitedAmount initialDiscount amountAfterDiscount cupon");

  const { commitedAmount } = plans;
  const discounts = await Discount.find();

  // Find the highest applicable discount
  let highestApplicableDiscountId = null;
  for (const discount of discounts) {
    if (commitedAmount >= discount.amount) {
      highestApplicableDiscountId = discount._id;
    }
  }
 
  const updatedDiscounts = discounts.map((discount) => {
    return {
      ...discount.toObject(),
      isApplied: plans?.cupon
        ? false
        : discount._id.equals(highestApplicableDiscountId),
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
          discounts: updatedDiscounts,
        },
      },
    },
  });
});
