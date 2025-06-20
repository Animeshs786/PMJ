const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getRepeatPurchasePlansCount = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;

  if (!salePersonId) {
    return next(new AppError("Sale Person ID is required", 400));
  }

  const plans = await UserPlan.find({
    salePersonId,
    isRepeatPurchaseView: false,
  })
    .populate("user", "name mobile")
    .sort("-createdAt");

  const userPlanCount = {};
  plans.forEach((plan) => {
    userPlanCount[plan.user._id] = (userPlanCount[plan.user._id] || 0) + 1;
  });

  const repeatPlans = plans.filter((plan) => userPlanCount[plan.user._id] > 1);

  const response = repeatPlans.map((plan) => ({
    planId: plan._id,
    userName: plan.user.name,
    mobile: plan.user.mobile,
    maturityDate: plan.maturityDate,
  }));

  res.status(200).json({
    status: true,
    message: "Repeat purchase plans fetched successfully.",
    count: response?.length || 0,
  });
});
