// const UserPlan = require("../../../models/userPlan");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.getAllPlan = catchAsync(async (req, res, next) => {
//   const { userId: salePersonId } = req.user;

//   if (!salePersonId) {
//     return next(new AppError("Sale Person ID is required", 400));
//   }

//   // Get pagination parameters from query
//   const { page = 1, limit = 10 } = req.query;
//   const pageNum = parseInt(page, 10);
//   const limitNum = parseInt(limit, 10);

//   // Calculate the number of documents to skip
//   const skip = (pageNum - 1) * limitNum;

//   // Fetch total count and paginated data
//   const [totalCount, plans] = await Promise.all([
//     UserPlan.countDocuments({ salePersonId, status: { $ne: "Initiated" } }),
//     UserPlan.find({ salePersonId, status: { $ne: "Initiated" } })
//       .populate("user", "name mobile")
//       .sort("-createdAt")
//       .skip(skip)
//       .limit(limitNum),
//   ]);

//   const response = plans.map((plan) => ({
//     planId: plan._id,
//     userName: plan.user.name,
//     mobile: plan.user.mobile,
//     maturityDate: plan.maturityDate,
//   }));

//   res.status(200).json({
//     status: true,
//     message: "All plans fetched successfully.",
//     totalCount,
//     currentPage: pageNum,
//     totalPages: Math.ceil(totalCount / limitNum),
//     limit: limitNum,
//     data: response,
//   });
// });

const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllPlan = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;

  if (!salePersonId) {
    return next(new AppError("Sale Person ID is required", 400));
  }

  const {
    page = 1,
    limit = 10,
    dateFilter, // Optional date filter
    startDate,
    endDate,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const filter = { salePersonId, status: { $ne: "Initiated" } };

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

    filter.createdAt = { $gte: start, $lte: end }; // Use createdAt for filtering
  }

  // Fetch total count and paginated data
  const [totalCount, plans] = await Promise.all([
    UserPlan.countDocuments(filter),
    UserPlan.find(filter)
      .populate("user", "name mobile")
      .sort("-createdAt")
      .skip(skip)
      .limit(limitNum),
  ]);

  const response = plans.map((plan) => ({
    planId: plan._id,
    userName: plan.user.name,
    mobile: plan.user.mobile,
    maturityDate: plan.maturityDate,
  }));

  res.status(200).json({
    status: true,
    message: "All plans fetched successfully.",
    totalCount,
    currentPage: pageNum,
    totalPages: Math.ceil(totalCount / limitNum),
    limit: limitNum,
    data: response,
  });
});