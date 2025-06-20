// const GoldExchange = require("../../../models/goldExchange");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");

// exports.getAllGoldExchanges = catchAsync(async (req, res) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//   } = req.query;

//   const filter = {};

//   if (search) {
//     filter.name = { $regex: search, $options: "i" };
//   }
//   if (status) {
//     filter.status = status;
//   }

//   if (startDate) {
//     filter.createdAt = { $gte: new Date(startDate) };
//   }
//   if (endDate) {
//     filter.createdAt = { $lte: new Date(endDate) };
//   }

//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     GoldExchange,
//     null,
//     filter
//   );
//   const goldExchanges = await GoldExchange.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: goldExchanges.length,
//     data: {
//       goldExchanges,
//     },
//   });
// });


const GoldExchange = require("../../../models/goldExchange");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getAllGoldExchanges = catchAsync(async (req, res, next) => {
  const {
    search,
    dateFilter,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    status,
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
    // If no date filter, use startDate and endDate for backward compatibility
    if (startDate) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  // Search Filter Logic for name, mobileNumber, email, or message
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } }, // Case-insensitive search
      { email: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  // Status Filter
  if (status) {
    filter.status = status;
  }

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    GoldExchange,
    null,
    filter
  );

  // Fetch gold exchanges with filter, pagination, and sorting
  const goldExchanges = await GoldExchange.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: goldExchanges.length,
    data: {
      goldExchanges,
    },
  });
});