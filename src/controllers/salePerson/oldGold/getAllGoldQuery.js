// const GoldExchange = require("../../../models/goldExchange");
// const Share = require("../../../models/share");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");

// exports.getAllGoldQuery = catchAsync(async (req, res, next) => {
//     const { _id: salePersonId } = req.user;
//   if (!salePersonId) {
//     return res.status(400).json({
//       status: false,
//       message: "Sale Person ID is required.",
//     });
//   }

//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//   } = req.query;

//   const sharedUsers = await Share.find({ salePerson: salePersonId }).select(
//     "mobile"
//   );

//   if (!sharedUsers.length) {
//     return res.status(200).json({
//       status: true,
//       totalResult: 0,
//       totalPage: 0,
//       currentPage: currentPage ? parseInt(currentPage) : 1,
//       results: 0,
//       data: {
//         service: [],
//       },
//       message: "No service queries found for the salesperson.",
//     });
//   }

//   const sharedMobileNumbers = sharedUsers.map((share) => share.mobile);

//   const filter = { mobileNumber: { $in: sharedMobileNumbers } };

//   if (search) {
//     filter.name = { $regex: search, $options: "i" };
//   }
//   if (status) {
//     filter.status = status;
//   }
//   if (startDate || endDate) {
//     filter.createdAt = {};
//     if (startDate) {
//       filter.createdAt.$gte = new Date(startDate);
//     }
//     if (endDate) {
//       filter.createdAt.$lte = new Date(endDate);
//     }
//   }

//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     GoldExchange,
//     null,
//     filter
//   );

//   const services = await GoldExchange.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: services.length,
//     data: {
//       service: services,
//     },
//   });
// });


const GoldExchange = require("../../../models/goldExchange");
const Share = require("../../../models/share");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");

exports.getAllGoldQuery = catchAsync(async (req, res, next) => {
  const { _id: salePersonId } = req.user;
  if (!salePersonId) {
    return res.status(400).json({
      status: false,
      message: "Sale Person ID is required.",
    });
  }

  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    status,
    dateFilter, // Optional date filter
  } = req.query;

  const sharedUsers = await Share.find({ salePerson: salePersonId }).select(
    "mobile"
  );

  if (!sharedUsers.length) {
    return res.status(200).json({
      status: true,
      totalResult: 0,
      totalPage: 0,
      currentPage: currentPage ? parseInt(currentPage) : 1,
      results: 0,
      data: {
        service: [],
      },
      message: "No gold exchange queries found for the salesperson.",
    });
  }

  const sharedMobileNumbers = sharedUsers.map((share) => share.mobile);

  const filter = { mobileNumber: { $in: sharedMobileNumbers } };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (status) {
    filter.status = status;
  }

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

  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    GoldExchange,
    null,
    filter
  );

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
      service: goldExchanges,
    },
  });
});