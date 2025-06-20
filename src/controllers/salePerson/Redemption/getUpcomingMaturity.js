// const UserPlan = require("../../../models/userPlan");
// const PlanDock = require("../../../models/planDock");
// const EmiList = require("../../../models/emiList");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");
// const AppError = require("../../../utils/AppError");

// exports.getUpcomingMaturity = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//   } = req.query;

//   const salePersonId = req.user.userId;

//   const filter = {
//     isRedem: false,
//   };

//   if (startDate) {
//     filter.planStartDate = { $gte: new Date(startDate) };
//   }

//   if (endDate) {
//     filter.planEndDate = { $lte: new Date(endDate) };
//   }

//   const planDockIds = await PlanDock.find({ salePersonId }).distinct("_id");

//   if (planDockIds.length === 0) {
//     return next(new AppError("No active user found for the salesperson", 404));
//   }

//   filter.planDock = { $in: planDockIds };

//   const userPlansWithElevenEMIs = await EmiList.aggregate([
//     {
//       $match: {
//         "emiList.status": "Paid",
//       },
//     },
//     {
//       $unwind: "$emiList",
//     },
//     {
//       $match: { "emiList.status": "Paid" },
//     },
//     {
//       $group: {
//         _id: "$userPlan",
//         paidCount: { $sum: 1 },
//       },
//     },
//     {
//       $match: { paidCount: 10 },
//     },
//     {
//       $project: { _id: 1 },
//     },
//   ]);

//   const eligibleUserPlanIds = userPlansWithElevenEMIs.map((plan) => plan._id);

//   if (eligibleUserPlanIds.length === 0) {
//     return next(new AppError("No pending redemptions found", 404));
//   }

//   filter._id = { $in: eligibleUserPlanIds };

//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     UserPlan,
//     null,
//     filter
//   );

//   const pendingRedemptions = await UserPlan.find(filter)
//     .populate({
//       path: "user",
//       select: "name email mobile city state country redemptionDate",
//       match: search ? { name: { $regex: search, $options: "i" } } : {},
//     })
//     .populate("planDock", "name email mobile")
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   const filteredPlans = pendingRedemptions.filter((plan) => plan.user);

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: filteredPlans.length,
//     data: filteredPlans,
//   });
// });
// const UserPlan = require("../../../models/userPlan");
// const PlanDock = require("../../../models/planDock");
// const EmiList = require("../../../models/emiList");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");
// const AppError = require("../../../utils/AppError");

// exports.getUpcomingMaturity = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     dateFilter, // Optional date filter
//   } = req.query;

//   const salePersonId = req.user.userId;

//   const filter = {
//     isRedem: false,
//   };

//   // Date Range Filter (only applied if dateFilter is provided)
//   if (dateFilter) {
//     const now = new Date();
//     const currentMonth = now.getMonth() + 1; // Months are 1-indexed for clarity
//     const currentYear = now.getFullYear();
//     const start = new Date();
//     const end = new Date();

//     switch (dateFilter.toUpperCase()) {
//       case "QTD":
//         if ([1, 2, 3].includes(currentMonth)) {
//           // Q4: January, February, March (current year)
//           start.setUTCFullYear(currentYear, 0, 1); // January 1st of the current year
//           end.setUTCFullYear(currentYear, 2, 31); // March 31st of the current year
//         } else if ([4, 5, 6].includes(currentMonth)) {
//           // Q1: April, May, June (current year)
//           start.setUTCFullYear(currentYear, 3, 1); // April 1st
//           end.setUTCFullYear(currentYear, 5, 30); // June 30th
//         } else if ([7, 8, 9].includes(currentMonth)) {
//           // Q2: July, August, September (current year)
//           start.setUTCFullYear(currentYear, 6, 1); // July 1st
//           end.setUTCFullYear(currentYear, 8, 30); // September 30th
//         } else {
//           // Q3: October, November, December (current year)
//           start.setUTCFullYear(currentYear, 9, 1); // October 1st
//           end.setUTCFullYear(currentYear, 11, 31); // December 31st
//         }
//         start.setUTCHours(0, 0, 0, 0);
//         end.setUTCHours(23, 59, 59, 999);
//         break;

//       case "MTD":
//         // Month-to-Date: Start from the first day of the current month to the current date
//         start.setUTCFullYear(currentYear, currentMonth - 1, 1); // First day of the current month
//         start.setUTCHours(0, 0, 0, 0);
//         end.setUTCHours(23, 59, 59, 999);
//         break;

//       case "YTD":
//         // Year-to-Date: Start from April 1st of the previous year to March 31st of the current year
//         if (currentMonth >= 4) {
//           // Current year from April 1st
//           start.setUTCFullYear(currentYear, 3, 1); // April 1st of the current year
//         } else {
//           // Previous year from April 1st
//           start.setUTCFullYear(currentYear - 1, 3, 1); // April 1st of the previous year
//         }
//         end.setUTCFullYear(currentYear, 2, 31); // March 31st of the current year
//         start.setUTCHours(0, 0, 0, 0);
//         end.setUTCHours(23, 59, 59, 999);
//         break;

//       case "CUSTOM":
//         // Custom Date Range: Use provided startDate and endDate
//         if (!startDate || !endDate) {
//           return next(
//             new AppError("Both startDate and endDate are required for custom filter.", 400)
//           );
//         }
//         start.setTime(new Date(startDate).getTime());
//         start.setUTCHours(0, 0, 0, 0);
//         end.setTime(new Date(endDate).getTime());
//         end.setUTCHours(23, 59, 59, 999);
//         break;

//       default:
//         return next(new AppError("Invalid date filter.", 400));
//     }

//     filter.planEndDate = { $gte: start, $lte: end }; // Use planEndDate for filtering
//   }

//   const planDockIds = await PlanDock.find({ salePersonId }).distinct("_id");

//   if (planDockIds.length === 0) {
//     return next(new AppError("No active user found for the salesperson", 404));
//   }

//   filter.planDock = { $in: planDockIds };

//   const userPlansWithTenEMIs = await EmiList.aggregate([
//     {
//       $match: {
//         "emiList.status": "Paid",
//       },
//     },
//     {
//       $unwind: "$emiList",
//     },
//     {
//       $match: { "emiList.status": "Paid" },
//     },
//     {
//       $group: {
//         _id: "$userPlan",
//         paidCount: { $sum: 1 },
//       },
//     },
//     {
//       $match: { paidCount: 10 },
//     },
//     {
//       $project: { _id: 1 },
//     },
//   ]);

//   const eligibleUserPlanIds = userPlansWithTenEMIs.map((plan) => plan._id);

//   if (eligibleUserPlanIds.length === 0) {
//     return next(new AppError("No users with exactly 10 EMIs paid found", 404));
//   }

//   filter._id = { $in: eligibleUserPlanIds };

//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     UserPlan,
//     null,
//     filter
//   );

//   const upcomingMaturities = await UserPlan.find(filter)
//     .populate({
//       path: "user",
//       select: "name email mobile city state country redemptionDate",
//       match: search ? { name: { $regex: search, $options: "i" } } : {},
//     })
//     .populate("planDock", "name email mobile")
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   const filteredPlans = upcomingMaturities.filter((plan) => plan.user);

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: filteredPlans.length,
//     data: filteredPlans,
//   });
// });

const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getUpcomingMaturity = catchAsync(async (req, res, next) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    dateFilter, // Optional date filter
  } = req.query;

  const salePersonId = req.user.userId;

  const filter = {
    isRedem: false,
    salePersonId, // Direct mapping with the salesperson
  };

  // Date Range Filter (only applied if dateFilter is provided)
  if (dateFilter) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Months are 1-indexed for clarity
    const currentYear = now.getFullYear();
    const start = new Date();
    const end = new Date();

    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([1, 2, 3].includes(currentMonth)) {
          // Q4: January, February, March (current year)
          start.setUTCFullYear(currentYear, 0, 1); // January 1st of the current year
          end.setUTCFullYear(currentYear, 2, 31); // March 31st of the current year
        } else if ([4, 5, 6].includes(currentMonth)) {
          // Q1: April, May, June (current year)
          start.setUTCFullYear(currentYear, 3, 1); // April 1st
          end.setUTCFullYear(currentYear, 5, 30); // June 30th
        } else if ([7, 8, 9].includes(currentMonth)) {
          // Q2: July, August, September (current year)
          start.setUTCFullYear(currentYear, 6, 1); // July 1st
          end.setUTCFullYear(currentYear, 8, 30); // September 30th
        } else {
          // Q3: October, November, December (current year)
          start.setUTCFullYear(currentYear, 9, 1); // October 1st
          end.setUTCFullYear(currentYear, 11, 31); // December 31st
        }
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;

      case "MTD":
        // Month-to-Date: Start from the first day of the current month to the current date
        start.setUTCFullYear(currentYear, currentMonth - 1, 1); // First day of the current month
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;

      case "YTD":
        // Year-to-Date: Start from April 1st of the previous year to March 31st of the current year
        if (currentMonth >= 4) {
          // Current year from April 1st
          start.setUTCFullYear(currentYear, 3, 1); // April 1st of the current year
        } else {
          // Previous year from April 1st
          start.setUTCFullYear(currentYear - 1, 3, 1); // April 1st of the previous year
        }
        end.setUTCFullYear(currentYear, 2, 31); // March 31st of the current year
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;

      case "CUSTOM":
        // Custom Date Range: Use provided startDate and endDate
        if (!startDate || !endDate) {
          return next(
            new AppError("Both startDate and endDate are required for custom filter.", 400)
          );
        }
        start.setTime(new Date(startDate).getTime());
        start.setUTCHours(0, 0, 0, 0);
        end.setTime(new Date(endDate).getTime());
        end.setUTCHours(23, 59, 59, 999);
        break;

      default:
        return next(new AppError("Invalid date filter.", 400));
    }

    filter.planEndDate = { $gte: start, $lte: end }; // Use planEndDate for filtering
  }

  const userPlansWithTenEMIs = await EmiList.aggregate([
    {
      $match: {
        "emiList.status": "Paid",
      },
    },
    {
      $unwind: "$emiList",
    },
    {
      $match: { "emiList.status": "Paid" },
    },
    {
      $group: {
        _id: "$userPlan",
        paidCount: { $sum: 1 },
      },
    },
    {
      $match: { paidCount: 10 },
    },
    {
      $project: { _id: 1 },
    },
  ]);

  const eligibleUserPlanIds = userPlansWithTenEMIs.map((plan) => plan._id);

  if (eligibleUserPlanIds.length === 0) {
    return next(new AppError("No users with exactly 10 EMIs paid found", 404));
  }

  filter._id = { $in: eligibleUserPlanIds };

  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    UserPlan,
    null,
    filter
  );

  const upcomingMaturities = await UserPlan.find(filter)
    .populate({
      path: "user",
      select: "name email mobile city state country redemptionDate",
      match: search ? { name: { $regex: search, $options: "i" } } : {},
    })
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  const filteredPlans = upcomingMaturities.filter((plan) => plan.user);

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: filteredPlans.length,
    data: filteredPlans,
  });
});
