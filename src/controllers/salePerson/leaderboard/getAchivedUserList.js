

const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAchievedUserList = catchAsync(async (req, res, next) => {
  const {
    dateFilter = "MTD",
    page = 1,
    limit = 10,
    salePersonId,
    startDate,
    endDate,
  } = req.query;

  if (!salePersonId) {
    return next(new AppError("Sale Person ID is required", 400));
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1; // Months are 1-indexed
  const currentYear = now.getFullYear();
  let targetMonths = [];

  // Date Filter Logic (optional)
  if (dateFilter) {
    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([1, 2, 3].includes(currentMonth)) {
          // Q4: January, February, March (current year)
          targetMonths = [1, 2, 3];
        } else if ([4, 5, 6].includes(currentMonth)) {
          // Q1: April, May, June (current year)
          targetMonths = [4, 5, 6];
        } else if ([7, 8, 9].includes(currentMonth)) {
          // Q2: July, August, September (current year)
          targetMonths = [7, 8, 9];
        } else {
          // Q3: October, November, December (current year)
          targetMonths = [10, 11, 12];
        }
        break;

      case "MTD":
        // Month-to-Date: Current month only
        targetMonths = [currentMonth];
        break;

      case "YTD":
        // Year-to-Date: From April of the previous year to March of the current year
        if (currentMonth >= 4) {
          // Current year from April to December
          targetMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12];
        } else {
          // Previous year from April to December, and current year from January to March
          targetMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
        }
        break;

      case "CUSTOM":
        // Custom Date Range: Use provided startDate and endDate
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

        // Extract months from the custom date range
        const startMonth = start.getMonth() + 1;
        const endMonth = end.getMonth() + 1;

        // Generate all months between startMonth and endMonth
        for (let month = startMonth; month <= endMonth; month++) {
          targetMonths.push(month);
        }
        break;

      default:
        return next(new AppError("Invalid date filter.", 400));
    }
  }

  // Pagination setup
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Base filter for salePersonId and status
  const filter = {
    salePersonId,
    status: "Active",
  };

  // Add date filter only if dateFilter is provided
  if (dateFilter) {
    filter.$expr = {
      $in: [{ $month: "$planStartDate" }, targetMonths],
    };
  }

  // Fetch user plans with pagination
  const userPlans = await UserPlan.find(filter)
    .populate("user", "name email mobile")
    .sort("-planStartDate")
    .skip(skip)
    .limit(limitNum);

  // Total count for pagination
  const totalPlans = await UserPlan.countDocuments(filter);

  // Prepare response
  const response = userPlans.map((plan) => ({
    planId: plan._id,
    name: plan.user?.name || "Unknown",
    email: plan.user?.email || "N/A",
    mobile: plan.user?.mobile || "N/A",
    purchaseDate: plan.planStartDate,
  }));

  // Send response with pagination details
  res.status(200).json({
    status: true,
    message: "Achieved user list fetched successfully.",
    data: response,
    currentPage: pageNum,
    totalPages: Math.ceil(totalPlans / limitNum),
    totalItems: totalPlans,
    itemsPerPage: limitNum,
  });
});
