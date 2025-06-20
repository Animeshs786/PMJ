// const UserPlan = require("../../../models/userPlan");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.getSinglePurchasePlansCount = catchAsync(async (req, res, next) => {
//   const { userId: salePersonId } = req.user;

//   if (!salePersonId) {
//     return next(new AppError("Sale Person ID is required", 400));
//   }

//   const plans = await UserPlan.find({
//     salePersonId,
//     isSinglePurchaseView: false,
//   })
//     .populate("user", "name mobile")
//     .sort("-createdAt");

//   // Group plans by user and filter those with exactly one plan
//   const userPlanCount = {};
//   plans.forEach((plan) => {
//     userPlanCount[plan.user._id] = (userPlanCount[plan.user._id] || 0) + 1;
//   });

//   const singlePlans = plans.filter(
//     (plan) => userPlanCount[plan.user._id] === 1
//   );

//   const response = singlePlans.map((plan) => ({
//     planId: plan._id,
//     userName: plan.user.name,
//     mobile: plan.user.mobile,
//     maturityDate: plan.maturityDate,
//   }));

//   res.status(200).json({
//     status: true,
//     message: "Single purchase plans fetched successfully.",
//     count: response.length || 0,
//   });
// });

const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getSinglePurchasePlansCount = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;

  if (!salePersonId) {
    return next(new AppError("Sale Person ID is required", 400));
  }

  // Get pagination parameters from query
  const { page = 1, limit = 10 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const allPlans = await UserPlan.find({ salePersonId })
    .populate("user", "name mobile")
    .sort("-createdAt");

  const userActivePlanStatus = {};
  allPlans.forEach((plan) => {
    const userId = plan.user._id.toString();
    if (!userActivePlanStatus[userId]) {
      userActivePlanStatus[userId] = false;
    }
    if (plan.status === "Active") {
      userActivePlanStatus[userId] = true;
    }
  });

  const usersWithoutActivePlans = allPlans.filter(
    (plan) => !userActivePlanStatus[plan.user._id.toString()]
  );

  const uniqueUsers = {};
  usersWithoutActivePlans.forEach((plan) => {
    uniqueUsers[plan.user._id.toString()] = plan;
  });

  const filteredUsers = Object.values(uniqueUsers);

  const totalCount = filteredUsers.length;
  const paginatedUsers = filteredUsers.slice(
    (pageNum - 1) * limitNum,
    pageNum * limitNum
  );

  const response = paginatedUsers.map((plan) => ({
    userId: plan.user._id,
    userName: plan.user.name,
    mobile: plan.user.mobile,
  }));

  res.status(200).json({
    status: true,
    message: "Users without active plans fetched successfully.",
    totalCount,
    currentPage: pageNum,
    totalPages: Math.ceil(totalCount / limitNum),
    limit: limitNum,
    data: response,
  });
});

