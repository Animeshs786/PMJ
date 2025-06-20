const UserAssign = require("../../../models/userAssign");
const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

exports.getAnalytics = catchAsync(async (req, res) => {
  const { _id: collectionAgentId } = req.user;
  const now = new Date();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const target = 50;

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);

  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

  const assignments = await UserAssign.find({
    collectionAgent: collectionAgentId,
  }).populate("user");
  const assignedUsers = assignments.map((assignment) => assignment.user);

  let todayCollection = { count: 0, value: 0 };
  let totalCollection = { count: 0, value: 0 };
  let currentMonthCollection = { count: 0, value: 0 };
  let previousMonthPaidCollection = { count: 0, value: 0 };
  let previousMonthPendingCollection = { count: 0, value: 0 };

  for (const user of assignedUsers) {
    const activePlans = await UserPlan.find({
      user: user._id,
      status: "Active",
    }).populate("plan", "name commitedAmount");

    for (const plan of activePlans) {
      const emiList = await EmiList.findOne({
        user: user._id,
        userPlan: plan._id,
      });

      if (emiList) {
        emiList.emiList.forEach((emi) => {
          const paidDate = emi.paidDate ? new Date(emi.paidDate) : null;
          const dueDate = emi.dueDate ? new Date(emi.dueDate) : null;

          // Today's collection
          if (
            emi.status === "Paid" &&
            paidDate &&
            paidDate.toISOString().split("T")[0] ===
              today.toISOString().split("T")[0]
          ) {
            todayCollection.count++;
            todayCollection.value += plan.commitedAmount;
          }

          // Total collection
          if (emi.status === "Paid") {
            totalCollection.count++;
            totalCollection.value += plan.commitedAmount;
          }

          // Current month's collection
          if (
            emi.status === "Paid" &&
            paidDate &&
            paidDate.getMonth() === currentMonth &&
            paidDate.getFullYear() === currentYear
          ) {
            currentMonthCollection.count++;
            currentMonthCollection.value += plan.commitedAmount;
          }

          // Previous month's paid collection
          if (
            emi.status === "Paid" &&
            paidDate &&
            paidDate >= startOfCurrentMonth && // EMIs paid on or after the start of the current month
            paidDate <= endOfCurrentMonth && // EMIs paid on or before the end of the current month
            dueDate &&
            dueDate < startOfCurrentMonth
          ) {
            previousMonthPaidCollection.count++;
            previousMonthPaidCollection.value += plan.commitedAmount;
          }

          // Previous month's pending collection
          if (
            emi.status === "Pending" &&
            dueDate &&
            dueDate < startOfCurrentMonth
          ) {
            previousMonthPendingCollection.count++;
            previousMonthPendingCollection.value += plan.commitedAmount;
          }
        });
      }
    }
  }

  const percentage = (currentMonthCollection.count / target) * 100;

  res.status(200).json({
    status: true,
    data: [
      { todayCollection },
      { totalCollection },
      { currentMonthCollection },
      { previousMonthPaidCollection },
      { previousMonthPendingCollection },
      {
        targetPercentage: percentage.toFixed(2),
      },
    ],
  });
});
