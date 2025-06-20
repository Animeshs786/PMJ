const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateRedemption = catchAsync(async (req, res, next) => {
  const { isRedem, userPlan } = req.body;
  const filterObj = {};

  if (!userPlan) return next(new AppError("plan id  required.", 404));
  if(!isRedem) return next(new AppError("isRedem  required.", 404));
  
  if (isRedem) {
    filterObj.isRedem = isRedem;
    filterObj.redemptionDate = Date.now();
  }

  const plan = await UserPlan.findByIdAndUpdate(userPlan, filterObj, {
    new: true,
    runValidators: true,
  });

  if (!plan) {
    return next(new AppError("No Plan  request found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Plan updated successfully",
    data: {
      service: plan,
    },
  });
});
