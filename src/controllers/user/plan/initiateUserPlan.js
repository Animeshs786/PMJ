const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const Plan = require("../../../models/plan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.initiateUserPlan = catchAsync(async (req, res, next) => {
  const { planId, commitedAmount } = req.body;
  const userId = req.user._id;

  const plan = await Plan.findById(planId);
  if (!plan) {
    return next(new AppError("No plan found with that ID", 404));
  }

  let initialDiscount = 0;
  let amountAfterDiscount = 0;

  for (const discount of plan.discounts) {
    if (commitedAmount >= discount.amount) {
      initialDiscount = (commitedAmount * discount.discountValue) / 100;
    }
  }

  amountAfterDiscount = commitedAmount - initialDiscount;
  const rewardAmount = +commitedAmount;
  const advancePaid =
    commitedAmount * plan.advancePaymentNumber - +initialDiscount;
  const overAllBenefits = +rewardAmount + +initialDiscount;
  const redemptionValue = +advancePaid + +overAllBenefits;

  const planStartDate = new Date();
  const planEndDate = new Date(planStartDate);
  planEndDate.setMonth(planEndDate.getMonth() + plan.advancePaymentNumber);
  const maturityDate = new Date(planEndDate);
  maturityDate.setMonth(maturityDate.getMonth() + 1);

  const newUserPlan = await UserPlan.create({
    user: userId,
    plan: planId,
    planStartDate,
    planEndDate,
    maturityDate,
    initialDiscount,
    rewardAmount,
    amountAfterDiscount,
    advancePaid,
    overAllBenefits,
    redemptionValue,
    advancePaymentNumber: plan.advancePaymentNumber,
    commitedAmount,
    status: "Initiated",
  });

  const emiList = [];
  const currentDate = new Date();
  const paymentNumber = plan.advancePaymentNumber;

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
      monthlyAdvance: i === 0 ? +amountAfterDiscount : +commitedAmount,
      status,
      dueDate: formatDate(dueDate),
      paidDate: "",
    });
  }

  await EmiList.create({
    user: userId,
    userPlan: newUserPlan._id,
    emiList,
  });

  res.status(201).json({
    status: true,
    message: "Plan initiated successfully.",
    data: {
      userPlan: newUserPlan,
      emiList,
    },
  });
});
