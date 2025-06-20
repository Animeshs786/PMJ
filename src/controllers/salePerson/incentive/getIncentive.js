// const EmiList = require("../../../models/emiList");
// const UserPlan = require("../../../models/userPlan");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.getIncentiveList = catchAsync(async (req, res, next) => {
//     const { dateFilter = "MTD", page = 1, limit = 10 } = req.query;
//     const salePersonId = req.user.userId;
  
//     const pageNumber = Math.max(1, parseInt(page));
//     const pageSize = Math.max(1, parseInt(limit));
//     const skip = (pageNumber - 1) * pageSize;
  
//     const currentMonth = new Date().getMonth() + 1;
//     const currentYear = new Date().getFullYear();
//     let startDate, endDate;
  
//     if (dateFilter === "MTD") {
//       startDate = new Date(currentYear, currentMonth - 1, 1);
//       endDate = new Date(currentYear, currentMonth, 0);
//     } else if (dateFilter === "QTD") {
//       if (currentMonth <= 3) {
//         startDate = new Date(currentYear, 0, 1);
//         endDate = new Date(currentYear, 3, 0);
//       } else if (currentMonth <= 6) {
//         startDate = new Date(currentYear, 3, 1);
//         endDate = new Date(currentYear, 6, 0);
//       } else if (currentMonth <= 9) {
//         startDate = new Date(currentYear, 6, 1);
//         endDate = new Date(currentYear, 9, 0);
//       } else {
//         startDate = new Date(currentYear, 9, 1);
//         endDate = new Date(currentYear, 12, 0);
//       }
//     } else if (dateFilter === "YTD") {
//       startDate = new Date(currentYear, 0, 1);
//       endDate = new Date(currentYear, 11, 31);
//     } else {
//       return next(new AppError("Invalid date filter.", 400));
//     }
  
//     const [userPlans, totalCount] = await Promise.all([
//       UserPlan.find({
//         salePersonId,
//         planStartDate: { $gte: startDate, $lte: endDate },
//       })
//         .populate("user", "name city")
//         .populate("plan", "name")
//         .select("commitedAmount plan")
//         .skip(skip)
//         .limit(pageSize),
//       UserPlan.countDocuments({
//         salePersonId,
//         planStartDate: { $gte: startDate, $lte: endDate },
//       }),
//     ]);
  
//     if (!userPlans.length) {
//       return res.status(200).json({
//         status: true,
//         message: "No plans found for the selected date filter.",
//         data: [],
//       });
//     }
  
//     const incentives = [];
//     for (const plan of userPlans) {
//       const emi = await EmiList.findOne({ userPlan: plan._id }).select("emiList");
  
//       if (emi && emi.emiList.length > 0) {
//         const firstEmi = emi.emiList[0];
//         if (firstEmi.status === "Paid") { 
//           const incentive = (plan.commitedAmount * 6) / 100;
  
//           incentives.push({
//             userName: plan.user.name,
//             userCity: plan.user.city,
//             monthlyCommited: plan.commitedAmount,
//             planId: plan.plan._id,
//             planName: plan.plan.name,
//             firstEmiStatus: firstEmi.status,
//             firstEmiDueDate: firstEmi.dueDate,
//             incentive: incentive.toFixed(2),
//           });
//         }
//       }
//     }
  
//     res.status(200).json({
//       status: true,
//       message: "Incentive list fetched successfully.",
//       data: incentives,
//       pagination: {
//         totalRecords: incentives.length,
//         currentPage: pageNumber,
//         totalPages: Math.ceil(incentives.length / pageSize),
//         limit: pageSize,
//       },
//     });
//   });
  
const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getIncentiveList = catchAsync(async (req, res, next) => {
  const { dateFilter, page = 1, limit = 10, startDate, endDate } = req.query;
  const salePersonId = req.user.userId;

  const pageNumber = Math.max(1, parseInt(page));
  const pageSize = Math.max(1, parseInt(limit));
  const skip = (pageNumber - 1) * pageSize;

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // Months are 1-indexed
  const currentYear = now.getFullYear();
  let start, end;

  // Date Filter Logic (optional)
  if (dateFilter) {
    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([1, 2, 3].includes(currentMonth)) {
          // Q4: January, February, March (current year)
          start = new Date(currentYear, 0, 1); // January 1st
          end = new Date(currentYear, 2, 31); // March 31st
        } else if ([4, 5, 6].includes(currentMonth)) {
          // Q1: April, May, June (current year)
          start = new Date(currentYear, 3, 1); // April 1st
          end = new Date(currentYear, 5, 30); // June 30th
        } else if ([7, 8, 9].includes(currentMonth)) {
          // Q2: July, August, September (current year)
          start = new Date(currentYear, 6, 1); // July 1st
          end = new Date(currentYear, 8, 30); // September 30th
        } else {
          // Q3: October, November, December (current year)
          start = new Date(currentYear, 9, 1); // October 1st
          end = new Date(currentYear, 11, 31); // December 31st
        }
        break;

      case "MTD":
        // Month-to-Date: Start from the first day of the current month to the current date
        start = new Date(currentYear, currentMonth - 1, 1); // First day of the current month
        end = new Date(currentYear, currentMonth, 0); // Last day of the current month
        break;

      case "YTD":
        // Year-to-Date: Start from January 1st to December 31st of the current year
        start = new Date(currentYear, 0, 1); // January 1st
        end = new Date(currentYear, 11, 31); // December 31st
        break;

      case "CUSTOM":
        // Custom Date Range: Use provided startDate and endDate
        if (!startDate || !endDate) {
          return next(
            new AppError("Both startDate and endDate are required for custom filter.", 400)
          );
        }
        start = new Date(startDate);
        end = new Date(endDate); 
        break;

      default:
        return next(new AppError("Invalid date filter.", 400));
    }
  }

  // Base filter for salePersonId
  const filter = { salePersonId };

  // Add date filter only if dateFilter is provided
  if (dateFilter) {
    filter.planStartDate = { $gte: start, $lte: end };
  }

  const [userPlans, totalCount] = await Promise.all([
    UserPlan.find(filter)
      .populate("user", "name city")
      .populate("plan", "name")
      .select("commitedAmount plan")
      .skip(skip)
      .limit(pageSize),
    UserPlan.countDocuments(filter),
  ]);

  if (!userPlans.length) {
    return res.status(200).json({
      status: true,
      message: "No plans found for the selected date filter.",
      data: [],
    });
  }

  const incentives = [];
  for (const plan of userPlans) {
    const emi = await EmiList.findOne({ userPlan: plan._id }).select("emiList");

    if (emi && emi.emiList.length > 0) {
      const firstEmi = emi.emiList[0];
      if (firstEmi.status === "Paid") {
        const incentive = (plan.commitedAmount * 6) / 100;

        incentives.push({
          userName: plan.user.name,
          userCity: plan.user.city,
          monthlyCommited: plan.commitedAmount,
          planId: plan.plan._id,
          planName: plan.plan.name,
          firstEmiStatus: firstEmi.status,
          firstEmiDueDate: firstEmi.dueDate,
          incentive: incentive.toFixed(2),
        });
      }
    }
  }

  res.status(200).json({
    status: true,
    message: "Incentive list fetched successfully.",
    data: incentives,
    pagination: {
      totalRecords: totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
      limit: pageSize,
    },
  });
});

