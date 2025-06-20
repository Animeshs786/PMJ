const UserPlan = require("../../../models/userPlan");
const PlanDock = require("../../../models/planDock");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getAllActiveUser = catchAsync(async (req, res, next) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    dateFilter,
  } = req.query;

  const salePersonId = req.user.userId;

  const filter = {
    status: "Active",
    salePersonId, // Directly filter by salePersonId from UserPlan
  };

  // Date Range Filter (optional)
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
        if (startDate) {
          start.setTime(new Date(startDate).getTime());
          start.setUTCHours(0, 0, 0, 0);
        }
        if (endDate) {
          end.setTime(new Date(endDate).getTime());
          end.setUTCHours(23, 59, 59, 999);
        } else {
          end.setUTCHours(23, 59, 59, 999);
        }
        break;

      default:
        // Default to MTD
        start.setUTCFullYear(currentYear, currentMonth - 1, 1); // First day of the current month
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);
        break;
    }

    // Add createdAt filter only if dateFilter is provided
    filter.createdAt = { $gte: start, $lte: end };
  }

  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    UserPlan,
    null,
    filter
  );

  const activeUserPlans = await UserPlan.find(filter)
    .populate({
      path: "user",
      select: "name email mobile city state country",
      match: search ? { name: { $regex: search, $options: "i" } } : {},
    })
    .populate("planDock", "name email mobile")
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  const filteredPlans = activeUserPlans.filter((plan) => plan.user);

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: filteredPlans.length,
    data: filteredPlans,
  });
});
