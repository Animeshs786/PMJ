// const Exhibition = require("../../../models/exhibition");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");

// exports.getAllExhibitions = catchAsync(async (req, res) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     isActive,
//   } = req.query;

//   const filter = {};

//   if (search) {
//     filter.name = { $regex: search, $options: "i" };
//   }
//   if (isActive) {
//     filter.isActive = isActive;
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
//     Exhibition,
//     null,
//     filter
//   );
//   const exhibitions = await Exhibition.find(filter).skip(skip).limit(limit);
//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     message: "Exhibitions fetched successfully",
//     data: exhibitions,
//   });
// });


const Exhibition = require("../../../models/exhibition");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");

exports.getAllExhibitions = catchAsync(async (req, res, next) => {
  const {
    search,
    dateFilter,
    startDate,
    endDate,
    isActive,
    page: currentPage,
    limit: currentLimit,
  } = req.query;

  // Build filter
  const filter = {};

  // Apply search filter
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Apply isActive filter
  if (isActive) {
    filter.isActive = isActive === "true";
  }

  // Date Filter Logic
  let start, end;
  if (dateFilter) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([0, 1, 2].includes(currentMonth)) {
          start = new Date(currentYear, 0, 1); // Jan 1
          end = new Date(currentYear, 2, 31); // Mar 31
        } else if ([3, 4, 5].includes(currentMonth)) {
          start = new Date(currentYear, 3, 1); // Apr 1
          end = new Date(currentYear, 5, 30); // Jun 30
        } else if ([6, 7, 8].includes(currentMonth)) {
          start = new Date(currentYear, 6, 1); // Jul 1
          end = new Date(currentYear, 8, 30); // Sep 30
        } else {
          start = new Date(currentYear, 9, 1); // Oct 1
          end = new Date(currentYear, 11, 31); // Dec 31
        }
        break;

      case "MTD":
        start = new Date(currentYear, currentMonth, 1); // First day
        end = new Date(currentYear, currentMonth + 1, 0); // Last day
        break;

      case "YTD":
        if (currentMonth >= 3) {
          start = new Date(currentYear, 3, 1); // Apr 1
          end = new Date(currentYear + 1, 2, 31); // Mar 31 next year
        } else {
          start = new Date(currentYear - 1, 3, 1); // Apr 1 previous
          end = new Date(currentYear, 2, 31); // Mar 31 current
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

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
  } else if (startDate || endDate) {
    // Fallback to explicit startDate/endDate
    if (startDate) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
    }
    if (endDate) {
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    }
  } else {
    // No date filter
    start = null;
    end = null;
  }

  // Apply date filters to createdAt
  if (start) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$gte = start;
  }

  if (end) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = end;
  }

  // Apply pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    Exhibition,
    null,
    filter
  );

  // Fetch exhibitions
  const exhibitions = await Exhibition.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: exhibitions.length,
    message: "Exhibitions fetched successfully",
    data: exhibitions,
  });
});