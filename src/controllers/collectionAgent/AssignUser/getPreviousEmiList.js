/* eslint-disable no-else-return */
const UserAssign = require("../../../models/userAssign");
const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

exports.getPreviousEMIList = catchAsync(async (req, res) => {
  const { _id: collectionAgentId } = req.user;
  const { paidStatus } = req.query; // Filter option: "Paid" or "Pending"

  const now = new Date();
  const currentMonth = now.getMonth(); // Current month (0-indexed)
  const currentYear = now.getFullYear();

  // Calculate date ranges
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

  // Fetch assigned users for the collection agent
  const assignments = await UserAssign.find({
    collectionAgent: collectionAgentId,
  }).populate("user");
  const assignedUsers = assignments.map((assignment) => assignment.user);

  let emiList = [];

  for (const user of assignedUsers) {
    const activePlans = await UserPlan.find({
      user: user._id,
      status: "Active",
    }).populate("plan", "name commitedAmount");

    for (const plan of activePlans) {
      const emiData = await EmiList.findOne({
        user: user._id,
        userPlan: plan._id,
      });

      if (emiData) {
        const filteredEMIs = emiData.emiList.filter((emi) => {
          const dueDate = emi.dueDate ? new Date(emi.dueDate) : null;
          const paidDate = emi.paidDate ? new Date(emi.paidDate) : null;

          if (paidStatus === "Paid") {
            // Filter for paid EMIs in the current month
            return (
              emi.status === "Paid" &&
              paidDate >= startOfCurrentMonth &&
              paidDate <= endOfCurrentMonth &&
              dueDate &&
              dueDate < startOfCurrentMonth
            );
          } else if (paidStatus === "Pending") {
            // Filter for pending EMIs before the current month
            return (
              emi.status === "Pending" &&
              dueDate &&
              dueDate < startOfCurrentMonth
            );
          } else {
            // Return all EMIs (both paid and pending)
            return (
              (emi.status === "Paid" &&
                paidDate >= startOfCurrentMonth &&
                paidDate <= endOfCurrentMonth &&
                dueDate &&
                dueDate < startOfCurrentMonth) ||
              (emi.status === "Pending" &&
                dueDate &&
                dueDate < startOfCurrentMonth)
            );
          }
        });

        if (filteredEMIs.length > 0) {
          filteredEMIs.forEach((emi) =>
            emiList.push(formatUserPlanResponse(user, plan, emi, emiData))
          );
        }
      }
    }
  }

  res.status(200).json({
    status: true,
    message: "EMI list retrieved successfully.",
    data: emiList,
  });
});

// Helper function to format user plan response
function formatUserPlanResponse(user, plan, emi, emiData) {
  const remainingPendingPayments = emiData.emiList.filter(
    (emi) => emi.status === "Pending"
  ).length;

  let walletAmount = emiData.emiList.reduce(
    (total, emi) =>
      emi.status === "Paid" ? total + plan.commitedAmount : total,
    0
  );

  // Include reward amount if 11 payments are made
  if (emiData.emiList.filter((emi) => emi.status === "Paid").length === 11) {
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
