const UserAssign = require("../../../models/userAssign");
const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllAssignUser = catchAsync(async (req, res) => {
  const { _id: collectionAgentId } = req.user;

  // Find all assignments for the given collection agent
  const assignments = await UserAssign.find({
    collectionAgent: collectionAgentId,
  }).populate("user");

  if (assignments.length === 0) {
    return res.status(404).json({
      status: false,
      message: "No users assigned to this collection agent.",
    });
  }

  // Extract user details from the assignments
  const assignedUsers = assignments.map((assignment) => assignment.user);

  // Fetch active plans and EMI details for each user
  let allPlans = [];

  // Get the current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are 0-indexed in JavaScript
  const currentYear = currentDate.getFullYear();

  for (const user of assignedUsers) {
    const activePlans = await UserPlan.find({
      user: user._id,
      status: "Active",
    })
      .populate("plan", "name commitedAmount")
      .sort("-createdAt");

    for (const plan of activePlans) {
      const emiList = await EmiList.findOne({
        user: user._id,
        userPlan: plan._id,
      });

      if (emiList && emiList.emiList.length > 0) {
        // Find the EMI for the current month
        const currentMonthEMI = emiList.emiList.find((emi) => {
          const emiDate = new Date(emi.dueDate);
          return (
            emiDate.getMonth() + 1 === currentMonth &&
            emiDate.getFullYear() === currentYear
          );
        });

        // If there is no EMI for the current month, skip this plan
        if (!currentMonthEMI) {
          continue;
        }

        let remainingPendingPayments = 0;
        let walletAmount = 0;

        // Count remaining pending payments
        remainingPendingPayments = emiList.emiList.filter(
          (emi) => emi.status === "Pending"
        ).length;

        // Calculate wallet amount (total paid amount)
        let paidPaymentsCount = emiList.emiList.filter(
          (emi) => emi.status === "Paid"
        ).length;

        walletAmount = emiList.emiList.reduce((total, emi) => {
          if (emi.status === "Paid") {
            return total + plan.commitedAmount;
          }
          return total;
        }, 0);

        // If 11 payments are paid, add the committed amount as the 12th payment (reward)
        if (paidPaymentsCount === 11) {
          walletAmount += plan.commitedAmount;
        }

        // Check if the EMI for the current month is paid
        const isPaid = currentMonthEMI.status === "Paid";

        // Add each plan as a separate object in the final response array
        allPlans.push({
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
          dueDate: currentMonthEMI.dueDate,
          month: currentMonthEMI.month,
          remainingPendingPayments,
          walletAmount,
          isPaid, // Now correctly indicates if the current month's EMI is paid
        });
      }
    }
  }

  // Sort plans by dueDate
  allPlans.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  res.status(200).json({
    status: true,
    message: "Assigned users' plans retrieved successfully.",
    data: allPlans,
  });
});
