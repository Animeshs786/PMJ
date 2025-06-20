

const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getAllPendingRedemption = catchAsync(async (req, res, next) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    dateFilter, // Optional date filter
  } = req.query;

  const salePersonId = req.user.userId;

  const filter = {
    isRedem: false,
    salePersonId, // Directly use salePersonId from UserPlan
  };

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

      case "CUSTOM":
        if (!startDate || !endDate) {
          return next(
            new AppError(
              "Both startDate and endDate are required for custom filter.",
              400
            )
          );
        }
        start.setTime(new Date(startDate).getTime());
        end.setTime(new Date(endDate).getTime());
        break;

      default:
        return next(new AppError("Invalid date filter.", 400));
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    filter.planEndDate = { $gte: start, $lte: end };
  }

  const userPlansWithElevenEMIs = await EmiList.aggregate([
    {
      $match: {
        "emiList.status": "Paid",
      },
    },
    {
      $unwind: "$emiList",
    },
    {
      $match: { "emiList.status": "Paid" },
    },
    {
      $group: {
        _id: "$userPlan",
        paidCount: { $sum: 1 },
      },
    },
    {
      $match: { paidCount: 11 },
    },
    {
      $project: { _id: 1 },
    },
  ]);

  const eligibleUserPlanIds = userPlansWithElevenEMIs.map((plan) => plan._id);

  if (eligibleUserPlanIds.length === 0) {
    return next(new AppError("No pending redemptions found", 404));
  }

  filter._id = { $in: eligibleUserPlanIds };

  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    UserPlan,
    null,
    filter
  );

  const pendingRedemptions = await UserPlan.find(filter)
    .populate({
      path: "user",
      select: "name email mobile city state country redemptionDate",
      match: search ? { name: { $regex: search, $options: "i" } } : {},
    })
    .populate("planDock", "name email mobile")
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  const filteredPlans = pendingRedemptions.filter((plan) => plan.user);

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: filteredPlans.length,
    data: filteredPlans,
  });
});
