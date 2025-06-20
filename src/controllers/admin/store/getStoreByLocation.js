const Location = require("../../../models/location");
const Store = require("../../../models/store");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const getStoresByLocation = catchAsync(async (req, res, next) => {
  const {
    locationId,
    search,
    page = 1,
    limit = 10,
    dateFilter = "MTD",
  } = req.query;

  // Check if location exists
  const location = await Location.findById(locationId);
  if (!location) {
    return next(new AppError("Location not found.", 404));
  }

  // Date Filter Logic
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const start = new Date();
  const end = new Date();

  switch (dateFilter.toUpperCase()) {
    case "QTD":
      if ([1, 2, 3].includes(currentMonth)) {
        start.setUTCFullYear(currentYear, 0, 1); // January 1st
        end.setUTCFullYear(currentYear, 2, 31); // March 31st
      } else if ([4, 5, 6].includes(currentMonth)) {
        start.setUTCFullYear(currentYear, 3, 1); // April 1st
        end.setUTCFullYear(currentYear, 5, 30); // June 30th
      } else if ([7, 8, 9].includes(currentMonth)) {
        start.setUTCFullYear(currentYear, 6, 1); // July 1st
        end.setUTCFullYear(currentYear, 8, 30); // September 30th
      } else {
        start.setUTCFullYear(currentYear, 9, 1); // October 1st
        end.setUTCFullYear(currentYear, 11, 31); // December 31st
      }
      break;

    case "MTD":
      start.setUTCFullYear(currentYear, currentMonth - 1, 1); // First day of the current month
      break;

    case "YTD":
      if (currentMonth >= 4) {
        start.setUTCFullYear(currentYear, 3, 1); // April 1st of the current year
      } else {
        start.setUTCFullYear(currentYear - 1, 3, 1); // April 1st of the previous year
      }
      end.setUTCFullYear(currentYear, 2, 31); // March 31st of the current year
      break;

    default:
      return next(new AppError("Invalid date filter.", 400));
  }

  // Set time for start and end of the day
  start.setUTCHours(0, 0, 0, 0);
  end.setUTCHours(23, 59, 59, 999);

  // Build the filter
  const filter = {
    location: locationId,
    createdAt: { $gte: start, $lte: end },
  };

  // Add search filter
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Fetch stores
  const stores = await Store.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  // Count total results
  const totalResults = await Store.countDocuments(filter);

  res.status(200).json({
    status: true,
    message: "Stores fetched successfully.",
    data: stores,
    totalResults,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalResults / limit),
  });
});

module.exports = getStoresByLocation;
