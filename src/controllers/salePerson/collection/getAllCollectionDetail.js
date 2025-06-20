const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllCollectionDetail = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;

  if (!salePersonId) {
    return next(new AppError("Sale Person ID is required", 400));
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const userPlans = await UserPlan.find({
    salePersonId,
    status: "Active",
  }).populate("user", "name mobile");

  let overdue = { total: 0, count: 0 };
  let currentMonthDue = { total: 0, count: 0 };
  let totalCollectionTarget = { total: 0, count: 0 };
  let totalCollected = { total: 0, count: 0 };

  for (const plan of userPlans) {
    const emiRecords = await EmiList.findOne({ userPlan: plan._id });

    if (emiRecords && emiRecords.emiList.length > 0) {
      emiRecords.emiList.forEach((emi) => {
        const dueDate = new Date(emi.dueDate);

        if (
          emi.status === "Pending" &&
          (dueDate.getFullYear() < currentYear ||
            (dueDate.getFullYear() === currentYear &&
              dueDate.getMonth() < currentMonth))
        ) {
          overdue.total += emi.monthlyAdvance;
          overdue.count += 1;
        }

        if (
          emi.status === "Pending" &&
          dueDate.getFullYear() === currentYear &&
          dueDate.getMonth() === currentMonth
        ) {
          currentMonthDue.total += emi.monthlyAdvance;
          currentMonthDue.count += 1;
        }

        if (
          emi.status === "Pending" &&
          (dueDate.getFullYear() < currentYear ||
            (dueDate.getFullYear() === currentYear &&
              dueDate.getMonth() <= currentMonth))
        ) {
          totalCollectionTarget.total += emi.monthlyAdvance;
          totalCollectionTarget.count += 1;
        }

        if (
          emi.status === "Paid" &&
          (dueDate.getFullYear() < currentYear ||
            (dueDate.getFullYear() === currentYear &&
              dueDate.getMonth() <= currentMonth))
        ) {
          totalCollected.total += emi.monthlyAdvance;
          totalCollected.count += 1;
        }
      });
    }
  }

  const totalTargetAmount = totalCollectionTarget.total || 1;

  const currentMonthDuePercentage = parseFloat(
    ((currentMonthDue.total / totalTargetAmount) * 100).toFixed(2)
  );

  const totalCollectedPercentage = parseFloat(
    ((totalCollected.total / totalTargetAmount) * 100).toFixed(2)
  );

  const overduePercentage = parseFloat(
    ((overdue.total / totalTargetAmount) * 100).toFixed(2)
  );

  res.status(200).json({
    status: true,
    message: "Collection data fetched successfully.",
    data: {
      overdue,
      currentMonthDue,
      totalCollectionTarget,
      totalCollected,
      currentMonthDuePercentage,
      totalCollectedPercentage,
      overduePercentage,
    },
  });
});
