
const UserAssign = require("../../../models/userAssign");
const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

// 4. Get all paid EMIs for the current month
exports.getPreviousMonthPaidEMIs = catchAsync(async (req, res) => {
  const { _id: collectionAgentId } = req.user;
  const now = new Date();
  const currentMonth = now.getMonth(); // Current month (0-indexed)
  const currentYear = now.getFullYear();

  // Calculate the start and end of the current month
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

  // Fetch assigned users for the collection agent
  const assignments = await UserAssign.find({
    collectionAgent: collectionAgentId,
  }).populate("user");
  const assignedUsers = assignments.map((assignment) => assignment.user);

  let paidEMIs = [];

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
        // Filter EMIs paid in the current month
        const currentMonthPaidEMIs = emiList.emiList.filter((emi) => {
          const paidDate = emi.paidDate ? new Date(emi.paidDate) : null;
          const dueDate = emi.dueDate ? new Date(emi.dueDate) : null;
          return (
            emi.status === "Paid" &&
            paidDate &&
            paidDate >= startOfCurrentMonth && // EMIs paid on or after the start of the current month
            paidDate <= endOfCurrentMonth && // EMIs paid on or before the end of the current month
            dueDate &&
            dueDate < startOfCurrentMonth
          );
        });

        // Add the user and their plans if they have any paid EMIs in the current month
        if (currentMonthPaidEMIs.length > 0) {
          currentMonthPaidEMIs.forEach((emi) =>
            paidEMIs.push(formatUserPlanResponse(user, plan, emi, emiList))
          );
        }
      }
    }
  }

  res.status(200).json({
    status: true,
    message: "All paid EMIs for the current month retrieved successfully.",
    data: paidEMIs,
  });
});

// Helper function to format user plan response (same as before)
function formatUserPlanResponse(user, plan, emi, emiList) {
  const remainingPendingPayments = emiList.emiList.filter(
    (emi) => emi.status === "Pending"
  ).length;

  let walletAmount = emiList.emiList.reduce(
    (total, emi) =>
      emi.status === "Paid" ? total + plan.commitedAmount : total,
    0
  );

  // Include reward amount if 11 payments are made
  if (emiList.emiList.filter((emi) => emi.status === "Paid").length === 11) {
    walletAmount += plan.commitedAmount;
  }

  return {
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    profileImage: user.profileImage,
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
    month: emi.month,
    remainingPendingPayments,
    walletAmount,
    isPaid: emi.status === "Paid",
    paidDate: emi.paidDate,
  };
}
