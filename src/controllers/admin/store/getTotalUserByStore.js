// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const StoreAssign = require("../../../models/storeAssign");
// const UserPlan = require("../../../models/userPlan");

// exports.getTotalUserByStore = catchAsync(async (req, res, next) => {
//   const { page = 1, limit = 10, storeId } = req.body;

//   if (!storeId) {
//     return next(new AppError("Store ID is required.", 400));
//   }

//   const storeAssign = await StoreAssign.findOne({ store: storeId }).populate(
//     "salePerson"
//   );

//   if (
//     !storeAssign ||
//     !storeAssign.salePerson ||
//     storeAssign.salePerson.length === 0
//   ) {
//     return next(new AppError("No sale persons found for this store.", 404));
//   }

//   const salePersonIds = storeAssign.salePerson.map((sp) => sp.userId);

//   const userPlans = await UserPlan.find({
//     salePersonId: { $in: salePersonIds },
//   }).populate("user", "name mobile email");

//   const uniqueUsers = [];
//   const seenUsers = new Set();

//   userPlans.forEach((plan) => {
//     const userIdentifier = plan.user.mobile;
//     if (!seenUsers.has(userIdentifier)) {
//       seenUsers.add(userIdentifier);
//       uniqueUsers.push({
//         userId: plan.user._id,
//         userName: plan.user.name || "",
//         mobile: plan.user.mobile || "",
//         email: plan.user.email || "",
//       });
//     }
//   });

//   const startIndex = (page - 1) * limit;
//   const endIndex = page * limit;
//   const paginatedUsers = uniqueUsers.slice(startIndex, endIndex);

//   res.status(200).json({
//     status: true,
//     message: "Total customers in the store fetched successfully.",
//     totalCustomers: uniqueUsers.length,
//     currentPage: parseInt(page),
//     totalPages: Math.ceil(uniqueUsers.length / limit),
//     data: {
//       customers: paginatedUsers,
//     },
//   });
// });


const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const StoreAssign = require("../../../models/storeAssign");
const UserPlan = require("../../../models/userPlan");

exports.getTotalUserByStore = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, storeIds } = req.body;

  let userPlans = [];

  // If storeIds is provided and is a non-empty array, filter by storeIds
  if (storeIds && Array.isArray(storeIds) && storeIds.length > 0) {
    // Find store assignments for the given store IDs
    const storeAssigns = await StoreAssign.find({ store: { $in: storeIds } }).populate(
      "salePerson"
    );

    if (!storeAssigns || storeAssigns.length === 0) {
      return next(new AppError("No store assignments found for the provided store IDs.", 404));
    }

    // Collect all salePerson IDs from the store assignments
    const salePersonIds = storeAssigns
      .flatMap((storeAssign) => storeAssign.salePerson)
      .map((sp) => sp.userId)
      .filter((id) => id); // Remove any undefined/null IDs

    if (salePersonIds.length === 0) {
      return next(new AppError("No sale persons found for these stores.", 404));
    }

    // Find user plans for the collected salePerson IDs
    userPlans = await UserPlan.find({
      salePersonId: { $in: salePersonIds },
    }).populate("user", "name mobile email");
  } else {
    // If no storeIds provided, fetch all user plans
    userPlans = await UserPlan.find().populate("user", "name mobile email");
  }

  // Extract unique users
  const uniqueUsers = [];
  const seenUsers = new Set();

  userPlans.forEach((plan) => {
    const userIdentifier = plan.user.mobile;
    if (!seenUsers.has(userIdentifier)) {
      seenUsers.add(userIdentifier);
      uniqueUsers.push({
        userId: plan.user._id,
        userName: plan.user.name || "",
        mobile: plan.user.mobile || "",
        email: plan.user.email || "",
      });
    }
  });

  // Paginate results
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = uniqueUsers.slice(startIndex, endIndex);

  res.status(200).json({
    status: true,
    message: storeIds && storeIds.length > 0
      ? "Total customers across the stores fetched successfully."
      : "All customers fetched successfully.",
    totalCustomers: uniqueUsers.length,
    currentPage: parseInt(page),
    totalPages: Math.ceil(uniqueUsers.length / limit),
    data: {
      customers: paginatedUsers,
    },
  });
});
