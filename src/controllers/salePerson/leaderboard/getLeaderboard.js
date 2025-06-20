

// const Target = require("../../../models/target");
// const UserPlan = require("../../../models/userPlan");
// const SalePerson = require("../../../models/salePerson");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.getLeaderboard = catchAsync(async (req, res, next) => {
//   const { dateFilter = "MTD", startDate, endDate } = req.query;

//   const now = new Date();
//   const currentMonth = now.getMonth() + 1; // Months are 1-indexed
//   const currentYear = now.getFullYear();
//   let targetMonths = [];

//   switch (dateFilter.toUpperCase()) {
//     case "QTD":
//       if ([1, 2, 3].includes(currentMonth)) {
//         // Q4: January, February, March (current year)
//         targetMonths = [1, 2, 3];
//       } else if ([4, 5, 6].includes(currentMonth)) {
//         // Q1: April, May, June (current year)
//         targetMonths = [4, 5, 6];
//       } else if ([7, 8, 9].includes(currentMonth)) {
//         // Q2: July, August, September (current year)
//         targetMonths = [7, 8, 9];
//       } else {
//         // Q3: October, November, December (current year)
//         targetMonths = [10, 11, 12];
//       }
//       break;

//     case "MTD":
//       // Month-to-Date: Current month only
//       targetMonths = [currentMonth];
//       break;

//     case "YTD":
//       // Year-to-Date: From April of the previous year to March of the current year
//       if (currentMonth >= 4) {
//         // Current year from April to December
//         targetMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12];
//       } else {
//         // Previous year from April to December, and current year from January to March
//         targetMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
//       }
//       break;

//     case "CUSTOM":
//       // Custom Date Range: Use provided startDate and endDate
//       if (!startDate || !endDate) {
//         return next(
//           new AppError(
//             "Both startDate and endDate are required for custom filter.",
//             400
//           )
//         );
//       }
//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       // Extract months from the custom date range
//       const startMonth = start.getMonth() + 1;
//       const endMonth = end.getMonth() + 1;

//       // Generate all months between startMonth and endMonth
//       for (let month = startMonth; month <= endMonth; month++) {
//         targetMonths.push(month);
//       }
//       break;

//     default:
//       return next(new AppError("Invalid date filter.", 400));
//   }

//   // Fetch all salespeople
//   const allSalespeople = await SalePerson.find()
//     .select("name email mobile userId")
//     .populate("location", "name");

//   // Fetch targets for the selected period
//   const allTargets = await Target.find({ month: { $in: targetMonths } });

//   // Fetch user plans with valid salesperson IDs
//   const allUserPlans = await UserPlan.find({
//     status: "Active",
//     salePersonId: { $ne: "" }, // Exclude plans without a salesperson
//     $expr: {
//       $in: [{ $month: "$planStartDate" }, targetMonths],
//     },
//   });

//   const leaderboard = {};

//   // Initialize leaderboard with all salespeople
//   allSalespeople.forEach((salePerson) => {
//     leaderboard[salePerson.userId] = {
//       salePersonId: salePerson.userId,
//       name: salePerson.name || "Unknown",
//       email: salePerson.email || "N/A",
//       mobile: salePerson.mobile || "N/A",
//       totalTarget: 0,
//       achieved: 0,
//       value: 0,
//       location: salePerson.location?.name || "N/A",
//     };
//   });

//   // Process targets
//   allTargets.forEach((target) => {
//     const salePersonId = target.salePerson.toString();
//     if (leaderboard[salePersonId]) {
//       leaderboard[salePersonId].totalTarget += target.target;
//     }
//   });

//   // Process user plans
//   allUserPlans.forEach((plan) => {
//     const salePersonId = plan.salePersonId.trim();
//     if (leaderboard[salePersonId]) {
//       leaderboard[salePersonId].achieved += 1;
//       leaderboard[salePersonId].value += plan.commitedAmount;
//     }
//   });

//   // Convert leaderboard object to an array
//   const leaderboardArray = Object.values(leaderboard);

//   // Sort by achieved and value
//   leaderboardArray.sort((a, b) => b.achieved - a.achieved || b.value - a.value);

//   // Assign ranks
//   let rank = 1;
//   leaderboardArray.forEach((entry, index) => {
//     if (
//       index > 0 &&
//       leaderboardArray[index - 1].achieved === entry.achieved &&
//       leaderboardArray[index - 1].value === entry.value
//     ) {
//       entry.rank = leaderboardArray[index - 1].rank;
//     } else {
//       entry.rank = rank;
//     }
//     rank++;
//   });

//   // Send response
//   res.status(200).json({
//     status: true,
//     message: "Salesperson leaderboard fetched successfully.",
//     data: leaderboardArray.map((entry) => ({
//       rank: entry.rank,
//       name: entry.name,
//       email: entry.email,
//       mobile: entry.mobile,
//       achieved: entry.achieved,
//       target: entry.totalTarget,
//       value: entry.value,
//       salePersonId: entry.salePersonId,
//       location: entry.location
//     })),
//   });
// });


const Target = require("../../../models/target");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson");
const StoreAssign = require("../../../models/storeAssign");
const Store = require("../../../models/store");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getLeaderboard = catchAsync(async (req, res, next) => {
  const { dateFilter = "MTD", startDate, endDate } = req.query;

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // Months are 1-indexed
  const currentYear = now.getFullYear();
  let targetMonths = [];

  switch (dateFilter.toUpperCase()) {
    case "QTD":
      if ([1, 2, 3].includes(currentMonth)) {
        targetMonths = [1, 2, 3];
      } else if ([4, 5, 6].includes(currentMonth)) {
        targetMonths = [4, 5, 6];
      } else if ([7, 8, 9].includes(currentMonth)) {
        targetMonths = [7, 8, 9];
      } else {
        targetMonths = [10, 11, 12];
      }
      break;

    case "MTD":
      targetMonths = [currentMonth];
      break;

    case "YTD":
      if (currentMonth >= 4) {
        targetMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12];
      } else {
        targetMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
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
      const start = new Date(startDate);
      const end = new Date(endDate);
      const startMonth = start.getMonth() + 1;
      const endMonth = end.getMonth() + 1;
      for (let month = startMonth; month <= endMonth; month++) {
        targetMonths.push(month);
      }
      break;

    default:
      return next(new AppError("Invalid date filter.", 400));
  }

  // Fetch all salespeople
  const allSalespeople = await SalePerson.find().select("name email mobile userId");

  // Fetch store assignments and populate store's location
  const storeAssignments = await StoreAssign.find()
    .populate({
      path: "store",
      select: "location",
      populate: {
        path: "location",
        select: "name",
      },
    });

  // Fetch targets for the selected period
  const allTargets = await Target.find({ month: { $in: targetMonths } });

  // Fetch user plans with valid salesperson IDs
  const allUserPlans = await UserPlan.find({
    status: "Active",
    salePersonId: { $ne: "" },
    $expr: {
      $in: [{ $month: "$planStartDate" }, targetMonths],
    },
  });

  const leaderboard = {};

  // Initialize leaderboard with all salespeople
  allSalespeople.forEach((salePerson) => {
    // Find the store assignment for this salesperson
    const assignment = storeAssignments.find((assign) =>
      assign.salePerson.some((sp) => sp.toString() === salePerson._id.toString())
    );

    // Get location name from store's location, or "N/A" if no assignment or no location
    const locationName = assignment?.store?.location?.name || "N/A";

    leaderboard[salePerson.userId] = {
      salePersonId: salePerson.userId,
      name: salePerson.name || "Unknown",
      email: salePerson.email || "N/A",
      mobile: salePerson.mobile || "N/A",
      totalTarget: 0,
      achieved: 0,
      value: 0,
      location: locationName,
    };
  });

  // Process targets
  allTargets.forEach((target) => {
    const salePersonId = target.salePerson.toString();
    if (leaderboard[salePersonId]) {
      leaderboard[salePersonId].totalTarget += target.target;
    }
  });

  // Process user plans
  allUserPlans.forEach((plan) => {
    const salePersonId = plan.salePersonId.trim();
    if (leaderboard[salePersonId]) {
      leaderboard[salePersonId].achieved += 1;
      leaderboard[salePersonId].value += plan.commitedAmount;
    }
  });

  // Convert leaderboard object to an array
  const leaderboardArray = Object.values(leaderboard);

  // Sort by achieved and value
  leaderboardArray.sort((a, b) => b.achieved - a.achieved || b.value - a.value);

  // Assign ranks
  let rank = 1;
  leaderboardArray.forEach((entry, index) => {
    if (
      index > 0 &&
      leaderboardArray[index - 1].achieved === entry.achieved &&
      leaderboardArray[index - 1].value === entry.value
    ) {
      entry.rank = leaderboardArray[index - 1].rank;
    } else {
      entry.rank = rank;
    }
    rank++;
  });

  // Send response
  res.status(200).json({
    status: true,
    message: "Salesperson leaderboard fetched successfully.",
    data: leaderboardArray.map((entry) => ({
      rank: entry.rank,
      name: entry.name,
      email: entry.email,
      mobile: entry.mobile,
      achieved: entry.achieved,
      target: entry.totalTarget,
      value: entry.value,
      salePersonId: entry.salePersonId,
      location: entry.location,
    })),
  });
});