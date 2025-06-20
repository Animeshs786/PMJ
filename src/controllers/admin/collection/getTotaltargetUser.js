const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getTotalTargetUsers = catchAsync(async (req, res, next) => {
  const { salePersonId } = req.query;

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

  const overdueUsers = [];

  for (const plan of userPlans) {
    const emiRecords = await EmiList.findOne({ userPlan: plan._id });

    if (emiRecords && emiRecords.emiList.length > 0) {
      emiRecords.emiList.forEach((emi) => {
        const dueDate = new Date(emi.dueDate);

        if (
          emi.status === "Pending" &&
          (dueDate.getFullYear() < currentYear ||
            (dueDate.getFullYear() === currentYear &&
              dueDate.getMonth() <= currentMonth))
        ) {
          overdueUsers.push({
            _id: emiRecords._id,
            commitedAmount: emi.monthlyAdvance,
            userName: plan.user.name,
            mobile: plan.user.mobile,
            dueDate: emi.dueDate.toISOString().split("T")[0],
          });
        }
      });
    }
  }

  res.status(200).json({
    status: true,
    message: "Total overdue users retrieved successfully.",
    overdueUsers,
  });
});
