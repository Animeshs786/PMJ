// const Discount = require("../../../models/discount");
// const catchAsync = require("../../../utils/catchAsync");

// exports.getAllDiscounts = catchAsync(async (req, res, next) => {
//     const discounts = await Discount.find();
  
//     res.status(200).json({
//       status: true,
//       message: "Discounts retrieved successfully",
//       data: {
//         discounts,
//       },
//     });
//   });
  
const Discount = require("../../../models/discount");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getAllDiscounts = catchAsync(async (req, res, next) => {
  const {
    search,
    dateFilter,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
  } = req.query;

  // Initialize filter object
  const filter = {};

  // Date Filter Logic using createdAt
  let start, end;

  if (dateFilter) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([0, 1, 2].includes(currentMonth)) {
          // Q1: January, February, March
          start = new Date(currentYear, 0, 1); // January 1st
          end = new Date(currentYear, 2, 31); // March 31st
        } else if ([3, 4, 5].includes(currentMonth)) {
          // Q2: April, May, June
          start = new Date(currentYear, 3, 1); // April 1st
          end = new Date(currentYear, 5, 30); // June 30th
        } else if ([6, 7, 8].includes(currentMonth)) {
          // Q3: July, August, September
          start = new Date(currentYear, 6, 1); // July 1st
          end = new Date(currentYear, 8, 30); // September 30th
        } else {
          // Q4: October, November, December
          start = new Date(currentYear, 9, 1); // October 1st
          end = new Date(currentYear, 11, 31); // December 31st
        }
        break;

      case "MTD":
        start = new Date(currentYear, currentMonth, 1); // First day of the current month
        end = new Date(currentYear, currentMonth + 1, 0); // Last day of the current month
        break;

      case "YTD":
        if (currentMonth >= 3) {
          // Current year from April to March
          start = new Date(currentYear, 3, 1); // April 1st
          end = new Date(currentYear + 1, 2, 31); // March 31st of the next year
        } else {
          // Previous year from April to March
          start = new Date(currentYear - 1, 3, 1); // April 1st of the previous year
          end = new Date(currentYear, 2, 31); // March 31st of the current year
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
        break;

      default:
        return next(new AppError("Invalid date filter.", 400));
    }

    // Set time for start and end of the day
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    // Apply date filter to createdAt
    filter.createdAt = { $gte: start, $lte: end };
  } else {
    // If no date filter is provided, include all discounts (no createdAt restriction)
  }

  // Search Filter Logic for amount or discountValue
  if (search) {
    // Check if search is a number for amount or discountValue
    const isNumber = !isNaN(search) && !isNaN(parseFloat(search));
    if (isNumber) {
      filter.$or = [
        { amount: parseFloat(search) }, // Exact match for amount
        { discountValue: parseFloat(search) }, // Exact match for discountValue
      ];
    }
  }

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    Discount,
    null,
    filter
  );

  // Fetch discounts with filter, pagination, and sorting
  const discounts = await Discount.find(filter)
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: true,
    results: discounts.length,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    message: "Discounts retrieved successfully",
    data: {
      discounts,
    },
  });
});