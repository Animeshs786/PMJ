const UserAssign = require("../../../models/userAssign");
const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

// 2. Get total user list whose EMI is collected
exports.getTransactionList = catchAsync(async (req, res) => {
  const { _id: collectionAgentId } = req.user;
  const { startDate, endDate } = req.query; // Date filters

  const assignments = await UserAssign.find({
    collectionAgent: collectionAgentId,
  }).populate("user");
  const assignedUsers = assignments.map((assignment) => assignment.user);

  let collectedUsers = [];
  let wallet = 0;

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
        const paidEMIs = emiList.emiList.filter((emi) => {
          const dueDate = emi.dueDate ? new Date(emi.dueDate) : null;
          if (startDate || endDate) {
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            return (
              emi.status === "Paid" &&
              dueDate &&
              (!start || dueDate >= start) &&
              (!end || dueDate <= end)
            );
          }
          return emi.status === "Paid";
        });

        paidEMIs.forEach((emi) => {
          collectedUsers.push(formatUserPlanResponse(user, plan, emi, emiList));
        });

        // Sum wallet amount for all collected users
        wallet += emiList.emiList.reduce(
          (total, emi) =>
            emi.status === "Paid" ? total + emi.monthlyAdvance : total,
          0
        );
      }
    }
  }

  res.status(200).json({
    status: true,
    message: "Total collected users retrieved successfully.",
    data: collectedUsers,
    wallet,
  });
});

// Helper function to format user plan response
function formatUserPlanResponse(user, plan, emi, emiList) {
  const remainingPendingPayments = emiList.emiList.filter(
    (emi) => emi.status === "Pending"
  ).length;

  let walletAmount = emiList.emiList.reduce(
    (total, emi) =>
      emi.status === "Paid" ? total + plan.commitedAmount : total,
    0
  );

  if (emiList.emiList.filter((emi) => emi.status === "Paid").length === 11) {
    walletAmount += plan.commitedAmount;
  }

  return {
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    planId: plan._id,
    planName: plan.plan.name,
    planStartDate: plan.planStartDate,
    planEndDate: plan.planEndDate,
    maturityDate: plan.maturityDate,
    redemptionValue: plan.redemptionValue,
    initialDiscount: plan.initialDiscount,
    advancePaymentNumber: plan.advancePaymentNumber,
    commitedAmount: plan.commitedAmount,
    rewardAmount: plan.rewardAmount,
    overAllBenefits: plan.overAllBenefits,
    status: plan.status,
    dueDate: emi.dueDate,
    remainingPendingPayments,
    walletAmount,
    month: emi.month,
    isPaid: emi.status === "Paid",
    paidDate: emi.paidDate,
  };
}
