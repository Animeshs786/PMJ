// const Target = require("../../../models/target");
// const UserPlan = require("../../../models/userPlan");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.getSalesPersonPerformance = catchAsync(async (req, res, next) => {
//   const { salePersonId, userId } = req.query;
//   const { dateFilter = "MTD" } = req.query;

//   if (!salePersonId)
//     return next(new AppError("Please provide salePersonId", 400));
//   if (!userId) return next(new AppError("Please provide userId", 400));
//   const currentMonth = new Date().getMonth() + 1;

//   let targetMonths = [];

//   if (dateFilter === "MTD") {
//     targetMonths = [currentMonth];
//   } else if (dateFilter === "QTD") {
//     if ([4, 5, 6, 7].includes(currentMonth)) {
//       targetMonths = [4, 5, 6, 7]; // QTD 1: April - July
//     } else if ([8, 9, 10, 11].includes(currentMonth)) {
//       targetMonths = [8, 9, 10, 11]; // QTD 2: August - November
//     } else {
//       targetMonths = [12, 1, 2, 3]; // QTD 3: December - March
//     }
//   } else if (dateFilter === "YTD") {
//     targetMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
//   } else {
//     return next(new AppError("Invalid date filter.", 400));
//   }

//   const targetDocs = await Target.find({
//     salePerson: salePersonId,
//     month: { $in: targetMonths },
//   });

//   const totalTarget = targetDocs.reduce((sum, doc) => sum + doc.target, 0);

//   const userPlans = await UserPlan.find({
//     salePersonId: userId,
//     status: "Active",
//     $expr: {
//       $in: [{ $month: "$planStartDate" }, targetMonths], // Match months directly
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

const Target = require("../../../models/target");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson");
const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getSalesPersonPerformance = catchAsync(async (req, res, next) => {
  const { dateFilter, startDate, endDate, salePerson, userId, search } = req.query;

  // Validate salePerson if provided
  let salePersonDoc = null;
  if (salePerson) {
    salePersonDoc = await SalePerson.findById(salePerson);
    if (!salePersonDoc) {
      return next(new AppError("Invalid salePerson ID.", 400));
    }
  }

  // Validate userId if provided
  if (userId) {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return next(new AppError("Invalid user ID.", 400));
    }
  }

  let targetMonths = [];
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // Date Filter Logic
  if (dateFilter) {
    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([1, 2, 3].includes(currentMonth)) {
          // Q1: Jan-Mar
          targetMonths = [
            { year: currentYear, month: 1 },
            { year: currentYear, month: 2 },
            { year: currentYear, month: 3 },
          ];
        } else if ([4, 5, 6].includes(currentMonth)) {
          // Q2: Apr-Jun
          targetMonths = [
            { year: currentYear, month: 4 },
            { year: currentYear, month: 5 },
            { year: currentYear, month: 6 },
          ];
        } else if ([7, 8, 9].includes(currentMonth)) {
          // Q3: Jul-Sep
          targetMonths = [
            { year: currentYear, month: 7 },
            { year: currentYear, month: 8 },
            { year: currentYear, month: 9 },
          ];
        } else {
          // Q4: Oct-Dec
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
          // Apr (current year) to Mar (next year)
          for (let month = 4; month <= 12; month++) {
            targetMonths.push({ year: currentYear, month });
          }
          for (let month = 1; month <= 3; month++) {
            targetMonths.push({ year: currentYear + 1, month });
          }
        } else {
          // Apr (previous year) to Mar (current year)
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
        const start = new Date(startDate);
        const end = new Date(endDate);
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

  // Build search filter
  let salePersonIds = [];
  let userIds = [];

  if (search) {
    const searchRegex = new RegExp(search, "i");

    // Search SalePerson name and mobile (via User)
    const salePersons = await SalePerson.find({ name: searchRegex });
    salePersonIds = salePersons.map((sp) => sp._id);

    const usersViaSalePerson = await User.find({
      $or: [
        { name: searchRegex },
        { mobile: searchRegex },
      ],
    });
    const userIdsFromSalePerson = usersViaSalePerson.map((u) => u._id);
    if (userIdsFromSalePerson.length > 0) {
      const salePersonsByUser = await SalePerson.find({
        userId: { $in: userIdsFromSalePerson },
      });
      salePersonIds.push(...salePersonsByUser.map((sp) => sp._id));
    }

    // Search User name and mobile
    const users = await User.find({
      $or: [
        { name: searchRegex },
        { mobile: searchRegex },
      ],
    });
    userIds = users.map((u) => u._id);
  }

  // Fetch targets
  const targetQuery = {};
  if (salePersonDoc) {
    targetQuery.salePerson = salePerson;
  } else if (salePersonIds.length > 0) {
    targetQuery.salePerson = { $in: salePersonIds };
  }
  if (targetMonths.length > 0) {
    targetQuery.month = { $in: targetMonths.map((tm) => tm.month) };
    targetQuery.year = { $in: targetMonths.map((tm) => tm.year) };
  }

  const targetDocs = await Target.find(targetQuery);
  const totalTarget = targetDocs.reduce((sum, doc) => sum + (doc.target || 0), 0);

  // Fetch user plans
  const userPlanQuery = {
    status: "Active",
  };

  if (salePersonDoc) {
    userPlanQuery.salePersonId = salePersonDoc.userId;
  } else if (salePersonIds.length > 0) {
    const salePersonsFiltered = await SalePerson.find({
      _id: { $in: salePersonIds },
    });
    userPlanQuery.salePersonId = {
      $in: salePersonsFiltered.map((sp) => sp.userId),
    };
  }

  if (userId) {
    userPlanQuery.user = userId;
  } else if (userIds.length > 0) {
    userPlanQuery.user = { $in: userIds };
  }

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
  const totalAmount = userPlans.reduce(
    (sum, plan) => sum + (plan.commitedAmount || 0),
    0
  );
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