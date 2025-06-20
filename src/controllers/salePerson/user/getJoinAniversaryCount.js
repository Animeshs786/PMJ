const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");

exports.getJoinAnniversaryCount = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;

  if (!salePersonId) {
    return res.status(400).json({
      status: false,
      message: "Sale Person ID is required.",
    });
  }

  const today = new Date();
  const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`; // Format: MM-DD

  // Fetch all user plans mapped with the salesperson
  const userPlans = await UserPlan.find({
    salePersonId,
    status: { $ne: "Initiated" }, // Exclude plans with "Initiated" status
  });

  // Create a map to track users by their first purchase date
  const userFirstPlanDateMap = new Map();

  userPlans.forEach((plan) => {
    const { user, planStartDate } = plan;
    if (user) {
      const userId = user.toString();
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

  // Count users for each anniversary year
  const anniversaryCounts = {
    firstYear: 0,
    secondYear: 0,
    thirdYear: 0,
    fourthYear: 0,
    fifthYear: 0,
  };

  userFirstPlanDateMap.forEach((firstPlanDate) => {
    const firstPlanMonthDay = `${
      firstPlanDate.getMonth() + 1
    }-${firstPlanDate.getDate()}`;
    if (firstPlanMonthDay === todayMonthDay) {
      const yearsSinceFirstPlan =
        today.getFullYear() - firstPlanDate.getFullYear();

      if (yearsSinceFirstPlan === 1) {
        anniversaryCounts.firstYear++;
      } else if (yearsSinceFirstPlan === 2) {
        anniversaryCounts.secondYear++;
      } else if (yearsSinceFirstPlan === 3) {
        anniversaryCounts.thirdYear++;
      } else if (yearsSinceFirstPlan === 4) {
        anniversaryCounts.fourthYear++;
      } else if (yearsSinceFirstPlan === 5) {
        anniversaryCounts.fifthYear++;
      }
    }
  });

  res.status(200).json({
    status: true,
    data: anniversaryCounts,
  });
});
