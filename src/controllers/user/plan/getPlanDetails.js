const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Service = require("../../../models/service");

exports.getPlanDetails = catchAsync(async (req, res, next) => {
  const {
    planId,
    isRedeemedView,
    isPendingRedeemView,
    isUpcomingMaturityView,
    serviceId,
    isRenrollAllView,
    isRepeatPurchaseView,
    isSinglePurchaseView,
  } = req.query;

  const plan = await UserPlan.findById(planId)
    .populate("plan", "name")
    .populate("planDock", "mobile")
    .sort("-createdAt");

  if (!plan) {
    return next(
      new AppError("Plan not found or not active for this user", 404)
    );
  }
  if (isRedeemedView) plan.isRedeemedView = isRedeemedView;
  if (isPendingRedeemView) plan.isPendingRedeemView = isPendingRedeemView;
  if (isUpcomingMaturityView)
    plan.isUpcomingMaturityView = isUpcomingMaturityView;
  if (isRenrollAllView) plan.isRenrollAllView = isRenrollAllView;
  if (isRepeatPurchaseView) plan.isRepeatPurchaseView = isRepeatPurchaseView;
  if (isSinglePurchaseView) plan.isSinglePurchaseView = isSinglePurchaseView;
  await plan.save();

  if (serviceId) {
    const service = await Service.findById(serviceId);
    if (!service) {
      return next(new AppError("Service not found", 404));
    }
    service.isViewed = true;
    await service.save();
  }

  const emiList = await EmiList.findOne({
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
    customerId: plan.user,
  };

  res.status(200).json({
    status: true,
    message: "Plan details fetched successfully.",
    data: planDetails,
  });
});
