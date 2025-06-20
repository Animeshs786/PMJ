const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllPlanCount = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;

  if (!salePersonId) {
    return next(new AppError("Sale Person ID is required", 400));
  }

  const plans = await UserPlan.countDocuments({
    salePersonId,
    isRenrollAllView: false,
  });

  res.status(200).json({
    status: true,
    message: "All plans fetched successfully.",
    count: plans,
  });
});
