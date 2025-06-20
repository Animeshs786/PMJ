const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getTotalCollectedUsers = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;
  const { dateFilter, startDate, endDate, page = 1, limit = 10 } = req.query;

  if (!salePersonId) {
    return next(new AppError("Sale Person ID is required", 400));
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
  } else {
    const now = new Date();
    // If no date filter is provided, show all data
    start = new Date(0); // Start from the earliest possible date
    end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    ); // La
  }

  // Fetch user plans for the sale person
  const userPlans = await UserPlan.find({
    salePersonId,
    status: "Active",
  }).populate("user", "name mobile");

  const collectedUsers = [];

  for (const plan of userPlans) {
    const emiRecords = await EmiList.findOne({ userPlan: plan._id });

    if (emiRecords && emiRecords.emiList.length > 0) {
      emiRecords.emiList.forEach((emi) => {
        const dueDate = new Date(emi.dueDate);

        // Check if the due date falls within the date range and status is "Paid"
        if (dueDate >= start && dueDate <= end && emi.status === "Paid") {
          collectedUsers.push({
            _id: emiRecords.userPlan,
            commitedAmount: emi.monthlyAdvance,
            userName: plan.user.name,
            mobile: plan.user.mobile,
            dueDate: emi.dueDate.toISOString().split("T")[0],
          });
        }
      });
    }
  }

  // Pagination
  const total = collectedUsers.length;
  const skip = (page - 1) * limit;
  const paginatedCollectedUsers = collectedUsers.slice(skip, skip + limit);

  res.status(200).json({
    status: true,
    message: "Total paid users retrieved successfully.",
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    collectedUsers: paginatedCollectedUsers,
  });
});