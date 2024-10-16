const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getClosePlan = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const userPlans = await UserPlan.find({
    user: userId,
    status: { $in: ["Completed"] },
  }).populate("plan", "name");

  if (!userPlans || userPlans.length === 0) {
    return next(new AppError("No  plan found for this user", 404));
  }

  let bills = [];

  for (const userPlan of userPlans) {
    const emiList = await EmiList.findOne({
      user: userId,
      userPlan: userPlan._id,
    });

    if (!emiList || emiList.emiList.length === 0) {
      continue;
    }
   
    const bill = {
      planId: userPlan._id,
      planName: userPlan.plan.name,
      status: userPlan.status,
      planStartDate: userPlan.planStartDate,
      planEndDate: userPlan.planEndDate,
      maturityDate: userPlan.maturityDate,
      redemptionValue: userPlan.redemptionValue,
      commitedAmount: userPlan.commitedAmount
    };
    bills.push(bill);
  }

  if (bills.length === 0) {
    return res.status(200).json({
      status: true,
      message: "No bill to generate at this moment.",
      data: [],
    });
  }

  res.status(200).json({
    status: true,
    message: "Plan Fetched successfully.",
    data: bills,
  });
});
