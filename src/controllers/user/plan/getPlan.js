

const Plan = require("../../../models/plan");
const Discount = require("../../../models/discount");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getPlanById = catchAsync(async (req, res, next) => {
  const { amount } = req.body;

  // Fetch the plan by committed amount
  const plan = await Plan.findOne({ commitedAmount: amount });

  if (!plan) {
    return next(new AppError("No plan found with that amount", 404));
  }

  // Fetch all discounts and sort by discountValue in ascending order
  const discounts = await Discount.find().sort({ discountValue: 1 });

  if (!discounts || discounts.length === 0) {
    return next(new AppError("No discounts available", 404));
  }

  const monthlyCommitedAmount = +amount;
  let initialDiscount = 0;

  // Calculate the maximum applicable discount
  for (const discount of discounts) {
    if (monthlyCommitedAmount >= discount.amount) {
      initialDiscount = (monthlyCommitedAmount * discount.discountValue) / 100;
    }
  }

  const amountAfterDiscount = monthlyCommitedAmount - initialDiscount;
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
    let dueDate;
    const status = i < paymentNumber ? "Pending" : "Bonus";

    if (status === "Bonus") {
      // Set bonus EMI due date to 331 days from current date
      dueDate = new Date(currentDate);
      dueDate.setDate(dueDate.getDate() + 331);
    } else {
      // Regular EMI due date
      dueDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + i,
        currentDate.getDate()
      );
    }

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
      discounts,
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
