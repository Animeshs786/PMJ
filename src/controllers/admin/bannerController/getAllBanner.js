// const Banner = require("../../../models/banner");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");

// exports.getAllBanners = catchAsync(async (req, res) => {
//   const { page: currentPage, limit: currentLimit } = req.query;

//   const filter = {};

//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     Banner,
//     null,
//     filter
//   );

//   const banners = await Banner.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort({ priority: 1 });

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: banners.length,
//     data: {
//       banners,
//     },
//   });
// });


const Banner = require("../../../models/banner");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getAllBanners = catchAsync(async (req, res, next) => {
  const { page: currentPage, limit: currentLimit, dateFilter, startDate, endDate, search } = req.query;

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
    // If no date filter is provided, include all banners (no createdAt restriction)
    // Optionally, set a default range if needed
    // For now, no filter on createdAt to show all banners
  }

  // Search Filter Logic
  if (search) {
    filter.$or = [
      { redirectPath: { $regex: search, $options: "i" } }, // Case-insensitive search
      { redirectType: { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    Banner,
    null,
    filter
  );
console.log(filter,"anbbanner filter")
  // Fetch banners with filter, pagination, and sorting
  const banners = await Banner.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ priority: 1 });

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: banners.length,
    data: {
      banners,
    },
  });
});