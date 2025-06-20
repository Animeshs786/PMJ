const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.generateUserBill = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const userPlans = await UserPlan.find({
    user: userId,
    status: { $in: ["Initiated", "Active"] },
  }).populate("plan", "name");

  if (!userPlans || userPlans.length === 0) {
    return next(
      new AppError("No active or initiated plan found for this user", 404)
    );
  }

  const normalizeDate = (date) => {
    return new Date(date.setHours(0, 0, 0, 0));
  };

  const currentDate = normalizeDate(new Date());
  const fiveDaysAhead = normalizeDate(new Date());
  fiveDaysAhead.setDate(currentDate.getDate() + 6);

  let bills = [];

  for (const userPlan of userPlans) {
    const emiList = await EmiList.findOne({
      user: userId,
      userPlan: userPlan._id,
    });

    if (!emiList || emiList.emiList.length === 0) {
      continue;
    }

    const dueEMIs = emiList.emiList.filter((emi) => {
      const emiDueDate = new Date(emi.dueDate);
      return (
        emi.status === "Pending" &&
        (emiDueDate < currentDate ||
          (emiDueDate >= currentDate && emiDueDate <= fiveDaysAhead))
      );
    });

    const remainingEMIs = emiList.emiList.filter(
      (emi) => emi.status === "Pending"
    ).length;

    const paidEMIs = emiList.emiList.filter(
      (emi) => emi.status === "Paid"
    ).length;

    if (dueEMIs.length > 0) {
      dueEMIs.forEach((dueEMI) => {
        const bill = {
          planId: userPlan._id,
          planName: userPlan.plan.name,
          month: dueEMI.month,
          amountDue: dueEMI.monthlyAdvance,
          dueDate: dueEMI.dueDate,
          status: dueEMI.status,
          remainingEMIs,
          planStartDate: userPlan.planStartDate,
          planEndDate: userPlan.planEndDate,
          maturityDate: userPlan.maturityDate,
          redemptionValue: userPlan.redemptionValue,
          remainingTenure: userPlan.advancePaymentNumber - paidEMIs,
        };
        bills.push(bill);
      });
    }
  }

  if (bills.length === 0) {
    return res.status(200).json({
      status: true,
      message: "No bill to generate at this moment.",
      data: [],
    });
  }

  res.status(200).json({
    status: true,
    message: "Bills generated successfully.",
    data: bills,
  });
});

