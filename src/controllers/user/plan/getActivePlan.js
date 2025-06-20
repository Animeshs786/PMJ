const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getActivePlan = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const activePlans = await UserPlan.find({
    user: userId,
    status: "Active",
  })
    .populate("plan", "name")
    .sort("-createdAt");

  if (!activePlans || activePlans.length === 0) {
    return next(new AppError("No active plans found for this user", 404));
  }

  let planDetails = [];

  for (const plan of activePlans) {
    const emiList = await EmiList.findOne({
      user: userId,
      userPlan: plan._id,
    });

    let nextDueDate = null;
    let remainingPendingPayments = 0;

    if (emiList && emiList.emiList.length > 0) {
      // Find the next due date
      const nextDueEMI = emiList.emiList.find(
        (emi) => emi.status === "Pending" && new Date(emi.dueDate) > new Date()
      );

      if (nextDueEMI) {
        nextDueDate = nextDueEMI.dueDate;
      }

      // Count remaining pending payments
      remainingPendingPayments = emiList.emiList.filter(
        (emi) => emi.status === "Pending"
      ).length;
    }

    // Prepare plan details
    planDetails.push({
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
      nextDueDate, // Include the next EMI due date
      remainingPendingPayments, // Include the count of pending payments
    });
  }

  res.status(200).json({
    status: true,
    message: "Active plans fetched successfully.",
    data: planDetails,
  });
});
