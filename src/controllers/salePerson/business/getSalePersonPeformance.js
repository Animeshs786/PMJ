

const Target = require("../../../models/target");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getSalesPersonPerformance = catchAsync(async (req, res, next) => {
  const { _id: salePersonId, userId } = req.user;
  const { dateFilter, startDate, endDate } = req.query;

  let targetMonths = [];
  let start, end;
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (dateFilter) {
    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([1, 2, 3].includes(currentMonth)) {
          targetMonths = [
            { year: currentYear, month: 1 },
            { year: currentYear, month: 2 },
            { year: currentYear, month: 3 },
          ];
        } else if ([4, 5, 6].includes(currentMonth)) {
          targetMonths = [
            { year: currentYear, month: 4 },
            { year: currentYear, month: 5 },
            { year: currentYear, month: 6 },
          ];
        } else if ([7, 8, 9].includes(currentMonth)) {
          targetMonths = [
            { year: currentYear, month: 7 },
            { year: currentYear, month: 8 },
            { year: currentYear, month: 9 },
          ];
        } else {
          targetMonths = [
            { year: currentYear, month: 10 },
            { year: currentYear, month: 11 },
            { year: currentYear, month: 12 },
          ];
        }
        break;

      case "MTD":
        targetMonths = [{ year: currentYear, month: currentMonth }];
        break;

      case "YTD":
        if (currentMonth >= 4) {
          for (let month = 4; month <= 12; month++) {
            targetMonths.push({ year: currentYear, month });
          }
        } else {
          for (let month = 4; month <= 12; month++) {
            targetMonths.push({ year: currentYear - 1, month });
          }
          for (let month = 1; month <= 3; month++) {
            targetMonths.push({ year: currentYear, month });
          }
        }
        break;

      case "CUSTOM":
        if (!startDate || !endDate) {
          return next(
            new AppError(
              "Both startDate and endDate are required for custom filter.",
              400
            )
          );
        }

        start = new Date(startDate);
        end = new Date(endDate);
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);

        const startYear = start.getFullYear();
        const endYear = end.getFullYear();
        const startMonth = start.getMonth() + 1;
        const endMonth = end.getMonth() + 1;

        for (let year = startYear; year <= endYear; year++) {
          const monthStart = year === startYear ? startMonth : 1;
          const monthEnd = year === endYear ? endMonth : 12;
          for (let month = monthStart; month <= monthEnd; month++) {
            targetMonths.push({ year, month });
          }
        }

        break;

      default:
        return next(new AppError("Invalid date filter.", 400));
    }
  }

  // Fetch targets (filter only if targetMonths is not empty)
  const targetQuery = {
    salePerson: salePersonId,
  };

  if (targetMonths.length > 0) {
    targetQuery.month = { $in: targetMonths.map((tm) => tm.month) };
  }

  const targetDocs = await Target.find(targetQuery);
  const totalTarget = targetDocs.reduce((sum, doc) => sum + doc.target, 0);

  // Build query for user plans
  const userPlanQuery = {
    salePersonId: userId,
    status: "Active",
  };

  if (targetMonths.length > 0) {
    userPlanQuery.$expr = {
      $and: [
        { $in: [{ $month: "$planStartDate" }, targetMonths.map((tm) => tm.month)] },
        { $in: [{ $year: "$planStartDate" }, targetMonths.map((tm) => tm.year)] },
      ],
    };
  }

  const userPlans = await UserPlan.find(userPlanQuery);

  const achieved = userPlans.length;
  const totalAmount = userPlans.reduce((sum, plan) => sum + plan.commitedAmount, 0);
  const achievementPercentage = totalTarget
    ? ((achieved / totalTarget) * 100).toFixed(2)
    : 0;
  const averageAmount = achieved > 0 ? (totalAmount / achieved).toFixed(2) : 0;

  res.status(200).json({
    status: true,
    message: "Salesperson performance fetched successfully.",
    data: {
      totalTarget,
      achieved,
      totalAmount,
      achievementPercentage,
      averageTicket: averageAmount,
    },
  });
});


// exports.getSalesPersonPerformance = catchAsync(async (req, res, next) => {
//   const { _id: salePersonId, userId } = req.user;
//   const { dateFilter = "MTD", startDate, endDate } = req.query;

//   const now = new Date();
//   const currentMonth = now.getMonth() + 1;
//   const currentYear = now.getFullYear();

//   let targetMonths = [];
//   let start, end;

//   switch (dateFilter.toUpperCase()) {
//     case "QTD":
//       if ([1, 2, 3].includes(currentMonth)) {
//         targetMonths = [{ year: currentYear, month: 1 }, { year: currentYear, month: 2 }, { year: currentYear, month: 3 }];
//       } else if ([4, 5, 6].includes(currentMonth)) {
//         targetMonths = [{ year: currentYear, month: 4 }, { year: currentYear, month: 5 }, { year: currentYear, month: 6 }];
//       } else if ([7, 8, 9].includes(currentMonth)) {
//         targetMonths = [{ year: currentYear, month: 7 }, { year: currentYear, month: 8 }, { year: currentYear, month: 9 }];
//       } else {
//         targetMonths = [{ year: currentYear, month: 10 }, { year: currentYear, month: 11 }, { year: currentYear, month: 12 }];
//       }
//       break;

//     case "MTD":
//       targetMonths = [{ year: currentYear, month: currentMonth }];
//       break;

//     case "YTD":
//       // Year-to-Date: From April of the previous year to March of the current year
//       if (currentMonth >= 4) {
//         // Current year from April to December
//         for (let month = 4; month <= 12; month++) {
//           targetMonths.push({ year: currentYear, month });
//         }
//       } else {
//         // Previous year from April to December, and current year from January to March
//         for (let month = 4; month <= 12; month++) {
//           targetMonths.push({ year: currentYear - 1, month });
//         }
//         for (let month = 1; month <= 3; month++) {
//           targetMonths.push({ year: currentYear, month });
//         }
//       }
//       break;

//     case "CUSTOM":
//       if (!startDate || !endDate) {
//         return next(
//           new AppError(
//             "Both startDate and endDate are required for custom filter.",
//             400
//           )
//         );
//       }
//       start = new Date(startDate);
//       end = new Date(endDate);

//       // Set time to start and end of the day for proper date range filtering
//       start.setUTCHours(0, 0, 0, 0);
//       end.setUTCHours(23, 59, 59, 999);

//       // Calculate all months between startDate and endDate
//       const startYear = start.getFullYear();
//       const endYear = end.getFullYear();
//       const startMonth = start.getMonth() + 1; // Months are 1-indexed
//       const endMonth = end.getMonth() + 1;

//       for (let year = startYear; year <= endYear; year++) {
//         const monthStart = year === startYear ? startMonth : 1;
//         const monthEnd = year === endYear ? endMonth : 12;

//         for (let month = monthStart; month <= monthEnd; month++) {
//           targetMonths.push({ year, month });
//         }
//       }

//       break;

//     default:
//       return next(new AppError("Invalid date filter.", 400));
//   }

//   // Fetch targets for the selected months
//   const targetDocs = await Target.find({
//     salePerson: salePersonId,
//     month: { $in: targetMonths.map((tm) => tm.month) },
//   });

//   const totalTarget = targetDocs.reduce((sum, doc) => sum + doc.target, 0);

//   // Fetch user plans for the selected months and years
//   const userPlans = await UserPlan.find({
//     salePersonId: userId,
//     status: "Active",
//     $expr: {
//       $and: [
//         { $in: [{ $month: "$planStartDate" }, targetMonths.map((tm) => tm.month)] },
//         { $in: [{ $year: "$planStartDate" }, targetMonths.map((tm) => tm.year)] },
//       ],
//     },
//   });

//   const achieved = userPlans.length;
//   const totalAmount = userPlans.reduce(
//     (sum, plan) => sum + plan.commitedAmount,
//     0
//   );
//   const achievementPercentage = totalTarget
//     ? ((achieved / totalTarget) * 100).toFixed(2)
//     : 0;
//   const averageAmount = achieved > 0 ? (totalAmount / achieved).toFixed(2) : 0;

//   res.status(200).json({
//     status: true,
//     message: "Salesperson performance fetched successfully.",
//     data: {
//       totalTarget,
//       achieved,
//       totalAmount,
//       achievementPercentage,
//       averageTicket: averageAmount,
//     },
//   });
// });