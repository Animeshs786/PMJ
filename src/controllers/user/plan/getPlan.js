const Plan = require("../../../models/plan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getPlanById = catchAsync(async (req, res, next) => {
  const { planId, amount } = req.body;

  const plan = await Plan.findById(planId);

  if (!plan) {
    return next(new AppError("No plan found with that ID", 404));
  }

  const monthlyCommitedAmount = +amount;
  let initialDiscount = 0;
  let amountAfterDiscount = 0;

  for (const discount of plan.discounts) {
    if (monthlyCommitedAmount >= discount.amount) {
      initialDiscount = (monthlyCommitedAmount * discount.discountValue) / 100;
    }
  }

  amountAfterDiscount = monthlyCommitedAmount - initialDiscount;
  const rewardAmount = monthlyCommitedAmount;
  const advancePaid =
    monthlyCommitedAmount * plan.advancePaymentNumber - initialDiscount;
  const overAllBenefits = rewardAmount + initialDiscount;
  const redemptionValue = advancePaid + overAllBenefits;

  // EMI schedule logic
  const currentDate = new Date();
  const emiList = [];
  const paymentNumber = plan.advancePaymentNumber;
  const monthlyEMI = monthlyCommitedAmount;

  // Helper function to format date as "yyyy-mm-dd"
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  for (let i = 0; i < paymentNumber + 1; i++) {
    const dueDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i,
      currentDate.getDate()
    );
    const status = i < paymentNumber ? "Pending" : "Bonus";

    emiList.push({
      month: i + 1,
      monthlyAdvance:
        i === 0
          ? amountAfterDiscount
          : i < paymentNumber
          ? monthlyEMI
          : "Bonus",
      status,
      dueDate: formatDate(dueDate),
    });
  }

  res.status(200).json({
    status: true,
    message: "Plan fetched successfully.",
    data: {
      ...plan.toObject(),
      initialDiscount,
      amountAfterDiscount,
      rewardAmount,
      advancePaid,
      overAllBenefits,
      redemptionValue,
      emiList,
    },
  });
});
