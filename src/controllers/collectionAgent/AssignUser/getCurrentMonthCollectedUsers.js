const UserAssign = require("../../../models/userAssign");
const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

// 3. Get current month total collection user list
exports.getCurrentMonthCollectedUsers = catchAsync(async (req, res) => {
  const { _id: collectionAgentId } = req.user;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Fetch assigned users for the collection agent
  const assignments = await UserAssign.find({
    collectionAgent: collectionAgentId,
  }).populate("user");
  const assignedUsers = assignments.map((assignment) => assignment.user);

  let collectedUsers = [];

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
        // Check for any "Paid" EMI for the current month
        const currentMonthEMIs = emiList.emiList.filter((emi) => {
          const paidDate = emi.paidDate ? new Date(emi.paidDate) : null;
          return (
            emi.status === "Paid" &&
            paidDate &&
            paidDate.getMonth() === currentMonth &&
            paidDate.getFullYear() === currentYear
          );
        });

        // Add the user and their plans if they have any "Paid" EMI for the current month
        if (currentMonthEMIs.length > 0) {
          currentMonthEMIs.forEach((emi) =>
            collectedUsers.push(
              formatUserPlanResponse(user, plan, emi, emiList)
            )
          );
        }
      }
    }
  }

  res.status(200).json({
    status: true,
    message: "Current month's collected users retrieved successfully.",
    data: collectedUsers,
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
