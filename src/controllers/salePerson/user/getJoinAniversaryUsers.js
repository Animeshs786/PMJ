/* eslint-disable no-case-declarations */

const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");

exports.getJoinAniversaryUsers = catchAsync(async (req, res, next) => {
  const { search, startDate, endDate, dateFilter, page = 1, limit = 10 } = req.query; // Added pagination params
  const { userId: salePersonId } = req.user;

  if (!salePersonId) {
    return res.status(400).json({
      status: false,
      message: "Sale Person ID is required.",
    });
  }

  const filter = {
    status: { $ne: "Initiated" },
    salePersonId,
  };

  // Handle date filtering
  if (dateFilter) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Months are 1-indexed
    const currentYear = now.getFullYear();
    const start = new Date();
    const end = new Date();

    switch (dateFilter.toUpperCase()) {
      case "CUSTOM":
        if (startDate) start.setTime(new Date(startDate).getTime());
        if (endDate) end.setTime(new Date(endDate).getTime());
        break;
      case "MTD":
        start.setUTCFullYear(currentYear, currentMonth - 1, 1);
        break;
      case "QTD":
        const quarterStartMonth = Math.floor((currentMonth - 1) / 3) * 3;
        start.setUTCFullYear(currentYear, quarterStartMonth, 1);
        break;
      case "YTD":
        if (currentMonth >= 4) {
          start.setUTCFullYear(currentYear, 3, 1);
        } else {
          start.setUTCFullYear(currentYear - 1, 3, 1);
        }
        break;
      default:
        start.setUTCFullYear(currentYear, currentMonth - 1, 1);
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }

  const userPlans = await UserPlan.find(filter).populate(
    "user",
    "name email mobile"
  );

  const today = new Date();
  const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`;

  const userFirstPlanDateMap = new Map();

  userPlans.forEach((plan) => {
    const { user, planStartDate } = plan;
    if (user) {
      const userId = user._id.toString();
      if (!userFirstPlanDateMap.has(userId)) {
        userFirstPlanDateMap.set(userId, new Date(planStartDate));
      } else {
        const existingDate = userFirstPlanDateMap.get(userId);
        if (new Date(planStartDate) < existingDate) {
          userFirstPlanDateMap.set(userId, new Date(planStartDate));
        }
      }
    }
  });

  const anniversaryUsers = [];
  userFirstPlanDateMap.forEach((firstPlanDate, userId) => {
    const user = userPlans.find(
      (plan) => plan.user && plan.user._id.toString() === userId
    )?.user;

    if (user) {
      const firstPlanMonthDay = `${
        firstPlanDate.getMonth() + 1
      }-${firstPlanDate.getDate()}`;
      if (firstPlanMonthDay === todayMonthDay) {
        const yearsSinceFirstPlan =
          today.getFullYear() - firstPlanDate.getFullYear();
        anniversaryUsers.push({
          userId,
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile || "",
          occasion: "Join Anniversary",
          yearsSinceFirstPlan,
        });
      }
    }
  });

  const filteredAnniversaryUsers = search
    ? anniversaryUsers.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
      )
    : anniversaryUsers;

  // Implementing pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);

  const paginatedAnniversaryUsers = filteredAnniversaryUsers.slice(
    startIndex,
    endIndex
  );

  res.status(200).json({
    status: true,
    data: paginatedAnniversaryUsers,
    total: filteredAnniversaryUsers.length, // Total number of anniversary users
    page: parseInt(page), // Current page
    totalPages: Math.ceil(filteredAnniversaryUsers.length / limit), // Total pages
  });
});

