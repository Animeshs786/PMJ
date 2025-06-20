
const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getCurrentMonthUsers = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;
  const { page = 1, limit = 10 } = req.query;

  if (!salePersonId) {
    return next(new AppError("Sale Person ID is required", 400));
  }

  // Get the first and last date of the current month
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the month
  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  ); // Last day of the month

  // Fetch user plans for the sale person
  const userPlans = await UserPlan.find({
    salePersonId,
    status: "Active",
  }).populate("user", "name mobile");

  const currentMonthUsers = [];

  for (const plan of userPlans) {
    const emiRecords = await EmiList.findOne({ userPlan: plan._id });

    if (emiRecords && emiRecords.emiList.length > 0) {
      emiRecords.emiList.forEach((emi) => {
        const dueDate = new Date(emi.dueDate);

        // Only include EMIs that are due within the current month and still pending
        if (dueDate >= start && dueDate <= end && emi.status === "Pending") {
          currentMonthUsers.push({
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
  const total = currentMonthUsers.length;
  const skip = (page - 1) * limit;
  const paginatedUsers = currentMonthUsers.slice(skip, skip + limit);

  res.status(200).json({
    status: true,
    message: "Current month due users retrieved successfully.",
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    users: paginatedUsers,
  });
});

// exports.getCurrentMonthUsers = catchAsync(async (req, res, next) => {
//   const { userId: salePersonId } = req.user;
//   const { startDate, endDate, page = 1, limit = 10 } = req.query;

//   if (!salePersonId) {
//     return next(new AppError("Sale Person ID is required", 400));
//   }

//   // Date Filter Logic
//   let start, end;

//   if (startDate && endDate) {
//     // Custom date range
//     start = new Date(startDate);
//     end = new Date(endDate);

//     // Set time for start and end of the day
//     start.setUTCHours(0, 0, 0, 0);
//     end.setUTCHours(23, 59, 59, 999);
//   } else {
//     // If no date filter is provided, show all data
//     start = new Date(0); // Start from the earliest possible date
//     end = new Date(); // End at the current date
//   }

//   // Fetch user plans for the sale person
//   const userPlans = await UserPlan.find({
//     salePersonId,
//     status: "Active",
//   }).populate("user", "name mobile");

//   const overdueUsers = [];

//   for (const plan of userPlans) {
//     const emiRecords = await EmiList.findOne({ userPlan: plan._id });

//     if (emiRecords && emiRecords.emiList.length > 0) {
//       emiRecords.emiList.forEach((emi) => {
//         const dueDate = new Date(emi.dueDate);

//         // Check if the due date falls within the date range and status is "Pending"
//         if (dueDate >= start && dueDate <= end && emi.status === "Pending") {
//           overdueUsers.push({
//             _id: emiRecords.userPlan,
//             commitedAmount: emi.monthlyAdvance,
//             userName: plan.user.name,
//             mobile: plan.user.mobile,
//             dueDate: emi.dueDate.toISOString().split("T")[0],
//           });
//         }
//       });
//     }
//   }

//   // Pagination
//   const total = overdueUsers.length;
//   const skip = (page - 1) * limit;
//   const paginatedOverdueUsers = overdueUsers.slice(skip, skip + limit);

//   res.status(200).json({
//     status: true,
//     message: "Overdue users retrieved successfully.",
//     total,
//     page,
//     limit,
//     totalPages: Math.ceil(total / limit),
//     overdueUsers: paginatedOverdueUsers,
//   });
// });
