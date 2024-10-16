const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.payEmiBill = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { month, planId } = req.body;

  if (!planId) return next(new AppError("Plan ID is required", 400));

  const userPlan = await UserPlan.findById(planId);

  if (!userPlan) {
    return next(
      new AppError("No active or initiated plan found for this user", 404)
    );
  }

  const emiList = await EmiList.findOne({
    user: userId,
    userPlan: userPlan._id,
  });

  if (!emiList || emiList.emiList.length === 0) {
    return next(new AppError("No EMI list found for this user plan", 404));
  }

  const emiToPay = emiList.emiList.find(
    (emi) => emi.month === month && emi.status === "Pending"
  );

  if (!emiToPay) {
    return next(
      new AppError("No pending EMI found for the specified month", 404)
    );
  }

  const currentDate = new Date();
  const emiDueDate = new Date(emiToPay.dueDate);
  if (currentDate > emiDueDate) {
    return next(
      new AppError("Cannot pay overdue EMI. Please contact support.", 400)
    );
  }

  const paymentAmount = emiToPay.monthlyAdvance;
  const isPaymentSuccessful = true;

  if (!isPaymentSuccessful) {
    return next(new AppError("Payment failed. Please try again later.", 500));
  }

  emiToPay.status = "Paid";
  emiToPay.paidDate = new Date();

  await emiList.save();

  res.status(200).json({
    status: true,
    message: `EMI for month ${emiToPay.month} has been successfully paid.`,
    data: {
      month: emiToPay.month,
      amountPaid: emiToPay.monthlyAdvance,
      paidDate: emiToPay.paidDate.toISOString().split("T")[0],
      status: emiToPay.status,
    },
  });
});
