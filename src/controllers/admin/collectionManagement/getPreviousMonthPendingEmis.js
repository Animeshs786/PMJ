// const UserAssign = require("../../../models/userAssign");
// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const catchAsync = require("../../../utils/catchAsync");
// const User = require("../../../models/user");

// exports.getPreviousMonthPendingEMIs = catchAsync(async (req, res) => {
//     const { collectionAgentId, page = 1, limit = 10 } = req.query;
//   const now = new Date();
//   const currentMonth = now.getMonth(); // Current month (0-indexed)
//   const currentYear = now.getFullYear();

//   // Calculate the start of the current month (to filter all EMIs before this date)
//   const startOfCurrentMonth = new Date(currentYear, currentMonth, 1); // Start of the current month

//   let assignedUsers;
//   if (collectionAgentId) {
//     const assignments = await UserAssign.find({
//       collectionAgent: collectionAgentId,
//     }).populate("user");
//     assignedUsers = assignments.map((assignment) => assignment.user);
//   } else {
//     assignedUsers = await User.find().lean();
//   }

//   let pendingEMIs = [];

//   for (const user of assignedUsers) {
//     const activePlans = await UserPlan.find({
//       user: user._id,
//       status: "Active",
//     }).populate("plan", "name commitedAmount");

//     for (const plan of activePlans) {
//       const emiList = await EmiList.findOne({
//         user: user._id,
//         userPlan: plan._id,
//       });

//       if (emiList) {
//         // Filter EMIs pending before the start of the current month
//         const allPendingEMIs = emiList.emiList.filter((emi) => {
//           const dueDate = emi.dueDate ? new Date(emi.dueDate) : null;
//           return (
//             emi.status === "Pending" && dueDate && dueDate < startOfCurrentMonth // Include all pending EMIs before the current month
//           );
//         });

//         // Add the user and their plans if they have any pending EMIs
//         if (allPendingEMIs.length > 0) {
//           allPendingEMIs.forEach((emi) =>
//             pendingEMIs.push(formatUserPlanResponse(user, plan, emi, emiList))
//           );
//         }
//       }
//     }
//   }

//   res.status(200).json({
//     status: true,
//     message: "All pending EMIs from previous months retrieved successfully.",
//     data: pendingEMIs,
//   });
// });

// // Helper function to format user plan response (same as before)
// function formatUserPlanResponse(user, plan, emi, emiList) {
//   const remainingPendingPayments = emiList.emiList.filter(
//     (emi) => emi.status === "Pending"
//   ).length;

//   let walletAmount = emiList.emiList.reduce(
//     (total, emi) =>
//       emi.status === "Paid" ? total + plan.commitedAmount : total,
//     0
//   );

//   // Include reward amount if 11 payments are made
//   if (emiList.emiList.filter((emi) => emi.status === "Paid").length === 11) {
//     walletAmount += plan.commitedAmount;
//   }

//   return {
//     userId: user._id,
//     userName: user.name,
//     userEmail: user.email,
//     profileImage: user.profileImage,
//     planId: plan._id,
//     planName: plan.plan.name,
//     planStartDate: plan.planStartDate,
//     planEndDate: plan.planEndDate,
//     maturityDate: plan.maturityDate,
//     redemptionValue: plan.redemptionValue,
//     initialDiscount: plan.initialDiscount,
//     advancePaymentNumber: plan.advancePaymentNumber,
//     commitedAmount: plan.commitedAmount,
//     rewardAmount: plan.rewardAmount,
//     overAllBenefits: plan.overAllBenefits,
//     status: plan.status,
//     dueDate: emi.dueDate,
//     month: emi.month,
//     remainingPendingPayments,
//     walletAmount,
//     isPaid: emi.status === "Paid",
//     paidDate: emi.paidDate,
//   };
// }

const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson");
const User = require("../../../models/user");
const Plan = require("../../../models/plan");
const UserAssign = require("../../../models/userAssign");
const CollectionAgent = require("../../../models/collectionAgent");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getPreviousMonthPendingEMIs = catchAsync(async (req, res, next) => {
  const {
    collectionAgent,
    salePerson,
    userId,
    plan,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  // Convert page and limit to integers
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Validate ObjectId filters
  if (collectionAgent) {
    const agentExists = await CollectionAgent.findById(collectionAgent);
    if (!agentExists) {
      return next(new AppError("Invalid collectionAgent ID.", 400));
    }
  }

  if (salePerson) {
    const salePersonExists = await SalePerson.findById(salePerson);
    if (!salePersonExists) {
      return next(new AppError("Invalid salePerson ID.", 400));
    }
  }

  if (userId) {
    const userExists = await User.findById(userId);
    if (!userExists) {
      return next(new AppError("Invalid user ID.", 400));
    }
  }

  if (plan) {
    const planExists = await Plan.findById(plan);
    if (!planExists) {
      return next(new AppError("Invalid plan ID.", 400));
    }
  }

  // Set date for start of current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  startOfCurrentMonth.setUTCHours(0, 0, 0, 0);

  // Build UserPlan query
  const userPlanQuery = {
    status: "Active",
  };

  // Apply ObjectId filters
  if (salePerson) {
    const salePersonDoc = await SalePerson.findById(salePerson);
    userPlanQuery.salePersonId = salePersonDoc.userId;
  }

  if (userId) {
    userPlanQuery.user = userId;
  }

  if (plan) {
    userPlanQuery.plan = plan;
  }

  // Handle collectionAgent filter
  let userIds = null;
  if (collectionAgent) {
    const assignments = await UserAssign.find({ collectionAgent });
    userIds = assignments.map((assignment) => assignment.user).filter(Boolean);
    if (userIds.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No users assigned to this collection agent.",
        data: {
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0,
          pendingEMIs: [],
        },
      });
    }
    userPlanQuery.user = { $in: userIds };
  }

  // Fetch user plans
  const userPlans = await UserPlan.find(userPlanQuery).populate([
    { path: "user", select: "name mobile email profileImage" },
    { path: "plan", select: "name commitedAmount" },
  ]);

  // Build search filter
  let filteredPlans = userPlans;
  if (search) {
    const searchRegex = new RegExp(search, "i");

    // User IDs (name or mobile)
    const users = await User.find({
      $or: [{ name: searchRegex }, { mobile: searchRegex }],
    });
    const userSearchIds = users.map((u) => u._id);

    // CollectionAgent IDs
    const collectionAgents = await CollectionAgent.find({
      name: searchRegex,
    });
    const collectionAgentIds = collectionAgents.map((ca) => ca._id);
    const assignments = collectionAgentIds.length
      ? await UserAssign.find({
          collectionAgent: { $in: collectionAgentIds },
        })
      : [];
    const collectionAgentUserIds = assignments.map((a) => a.user).filter(Boolean);

    // SalePerson IDs
    const salePersons = await SalePerson.find({
      name: searchRegex,
    });
    const salePersonUserIds = salePersons.map((sp) => sp.userId);

    // Plan IDs
    const plans = await Plan.find({
      name: searchRegex,
    });
    const planIds = plans.map((p) => p._id);

    // Filter plans
    filteredPlans = userPlans.filter((plan) => {
      let matches = false;

      // User name or mobile
      if (userSearchIds.some((id) => id.equals(plan.user?._id))) {
        matches = true;
      }

      // CollectionAgent name
      if (collectionAgentUserIds.some((id) => id.equals(plan.user?._id))) {
        matches = true;
      }

      // SalePerson name
      if (salePersonUserIds.includes(plan.salePersonId)) {
        matches = true;
      }

      // Plan name
      if (planIds.some((id) => id.equals(plan.plan?._id))) {
        matches = true;
      }

      return matches;
    });

    if (filteredPlans.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No matches found for the search term.",
        data: {
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0,
          pendingEMIs: [],
        },
      });
    }
  }

  const pendingEMIs = [];

  // Process EMI records
  for (const plan of filteredPlans) {
    const emiRecords = await EmiList.findOne({ userPlan: plan._id });
    if (emiRecords && emiRecords.emiList.length > 0) {
      const allPendingEMIs = emiRecords.emiList.filter((emi) => {
        const dueDate = emi.dueDate ? new Date(emi.dueDate) : null;
        return (
          emi.status === "Pending" &&
          dueDate &&
          dueDate < startOfCurrentMonth
        );
      });
      allPendingEMIs.forEach((emi) => {
        pendingEMIs.push(
          formatUserPlanResponse(plan.user, plan, emi, emiRecords)
        );
      });
    }
  }

  // Pagination
  const total = pendingEMIs.length;
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedPendingEMIs = pendingEMIs.slice(startIndex, endIndex);

  res.status(200).json({
    status: true,
    message: "All pending EMIs from previous months retrieved successfully.",
    data: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      pendingEMIs: paginatedPendingEMIs,
    },
  });
});

// Helper function to format user plan response
function formatUserPlanResponse(user, plan, emi, emiList) {
  const remainingPendingPayments = emiList.emiList.filter(
    (emi) => emi.status === "Pending"
  ).length;

  let walletAmount = emiList.emiList.reduce(
    (total, emi) =>
      emi.status === "Paid" ? total + (plan.commitedAmount || 0) : total,
    0
  );

  if (emiList.emiList.filter((emi) => emi.status === "Paid").length === 11) {
    walletAmount += plan.commitedAmount || 0;
  }

  return {
    userId: user?._id,
    userName: user?.name || "Unknown",
    userEmail: user?.email || "Unknown",
    profileImage: user?.profileImage || "",
    planId: plan._id,
    planName: plan.plan?.name || "Unknown",
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