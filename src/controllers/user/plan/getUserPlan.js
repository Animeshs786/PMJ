const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getUserPlan = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Fetch all plans where status is either "Initiated" or "Active"
  const userPlans = await UserPlan.find({
    user: userId,
    status: { $in: ["Initiated", "Active"] },
  }).populate("plan");

  if (!userPlans || userPlans.length === 0) {
    return next(
      new AppError("No active or initiated plans found for this user", 404)
    );
  }

  // For each plan, fetch the corresponding EMI list
  const plansWithEmiList = await Promise.all(
    userPlans.map(async (userPlan) => {
      const emiList = await EmiList.findOne({
        user: userId,
        userPlan: userPlan._id,
      });

      if (!emiList) {
        return next(new AppError("No EMI list found for a user plan", 404));
      }

      return {
        userPlan: {
          user: userPlan.user,
          plan: userPlan.plan._id,
          planStartDate: userPlan.planStartDate,
          planEndDate: userPlan.planEndDate,
          maturityDate: userPlan.maturityDate,
          initialDiscount: userPlan.initialDiscount,
          rewardAmount: userPlan.rewardAmount,
          amountAfterDiscount: userPlan.amountAfterDiscount,
          advancePaid: userPlan.advancePaid,
          overAllBenefits: userPlan.overAllBenefits,
          redemptionValue: userPlan.redemptionValue,
          advancePaymentNumber: userPlan.advancePaymentNumber,
          commitedAmount: userPlan.commitedAmount,
          status: userPlan.status,
          createdAt: userPlan.createdAt,
          _id: userPlan._id,
          __v: userPlan.__v,
        },
        emiList: emiList.emiList.map((emi) => ({
          month: emi.month,
          monthlyAdvance: emi.monthlyAdvance,
          status: emi.status,
          dueDate: emi.dueDate.toISOString().split("T")[0],
          paidDate: emi.paidDate
            ? emi.paidDate.toISOString().split("T")[0]
            : "",
        })),
      };
    })
  );

  res.status(200).json({
    status: true,
    message: "Plans retrieved successfully.",
    data: plansWithEmiList,
  });
});
