const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getPlanDetails = catchAsync(async (req, res, next) => {
  const { planId, userId } = req.query;

  const plan = await UserPlan.findOne({
    _id: planId,
    user: userId,
  })
    .populate("plan", "name")
    .populate("planDock", "mobile")
    .sort("-createdAt");

  if (!plan) {
    return next(
      new AppError("Plan not found or not active for this user", 404)
    );
  }

  const emiList = await EmiList.findOne({
    user: userId,
    userPlan: plan._id,
  });

  let nextDueDate = null;
  let remainingPendingPayments = 0;
  let totalPaidAmount = 0;

  if (emiList && emiList.emiList.length > 0) {
    const nextDueEMI = emiList.emiList.find(
      (emi) => emi.status === "Pending" && new Date(emi.dueDate) > new Date()
    );

    if (nextDueEMI) {
      nextDueDate = nextDueEMI.dueDate;
    }

    remainingPendingPayments = emiList.emiList.filter(
      (emi) => emi.status === "Pending"
    ).length;

    totalPaidAmount = emiList.emiList.reduce((total, emi) => {
      if (emi.status === "Paid") {
        return total + emi.monthlyAdvance;
      }
      return total;
    }, 0);
  }


  const planDetails = {
    planId: plan._id,
    planName: plan.plan.name,
    planStartDate: plan.planStartDate,
    planEndDate: plan.planEndDate,
    maturityDate: plan.maturityDate,
    redemptionValue: plan.redemptionValue,
    initialDiscount: plan.initialDiscount,
    advancePaymentNumber: plan.advancePaymentNumber,
    commitedAmount: plan.commitedAmount,
    rewardAmount: plan.rewardAmount,
    overAllBenefits: plan.overAllBenefits,
    status: plan.status,
    mobile: plan.planDock.mobile,
    nextDueDate,
    remainingPendingPayments,
    totalPaidAmount,
  };

  res.status(200).json({
    status: true,
    message: "Plan details fetched successfully.",
    data: planDetails,
  });
});
