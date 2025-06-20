const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");

exports.getInitiatePlan = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const digitalAccount = req.user.digitalAccount;
  const plans = await UserPlan.findOne({ user: userId, status: "Initiated" })
    .populate("planDock", "accountNumber")
    .sort("-createdAt")
    .populate("plan", "name")
    .populate("user", "name accountNumber")
    .select("planStartDate planEndDate maturityDate status");

  res.status(200).json({
    status: true,
    message: "Plan fetched successfully.",
    data: {
      userPlan: plans,
      digitalAccount,
    },
  });
});
