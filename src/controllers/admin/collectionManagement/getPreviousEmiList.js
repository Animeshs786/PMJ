// /* eslint-disable no-else-return */
// const UserAssign = require("../../../models/userAssign");
// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const catchAsync = require("../../../utils/catchAsync");
// const User = require("../../../models/user");

// exports.getPreviousEMIList = catchAsync(async (req, res) => {
//     const { collectionAgentId, page = 1, limit = 10 } = req.query;
//   const { paidStatus } = req.query; // Filter option: "Paid" or "Pending"

//   const now = new Date();
//   const currentMonth = now.getMonth(); // Current month (0-indexed)
//   const currentYear = now.getFullYear();

//   // Calculate date ranges
//   const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
//   const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);

//   let assignedUsers;
//   if (collectionAgentId) {
//     const assignments = await UserAssign.find({
//       collectionAgent: collectionAgentId,
//     }).populate("user");
//     assignedUsers = assignments.map((assignment) => assignment.user);
//   } else {
//     assignedUsers = await User.find().lean();
//   }

//   let emiList = [];

//   for (const user of assignedUsers) {
//     const activePlans = await UserPlan.find({
//       user: user._id,
//       status: "Active",
//     }).populate("plan", "name commitedAmount");

//     for (const plan of activePlans) {
//       const emiData = await EmiList.findOne({
//         user: user._id,
//         userPlan: plan._id,
//       });

//       if (emiData) {
//         const filteredEMIs = emiData.emiList.filter((emi) => {
//           const dueDate = emi.dueDate ? new Date(emi.dueDate) : null;
//           const paidDate = emi.paidDate ? new Date(emi.paidDate) : null;

//           if (paidStatus === "Paid") {
//             // Filter for paid EMIs in the current month
//             return (
//               emi.status === "Paid" &&
//               paidDate >= startOfCurrentMonth &&
//               paidDate <= endOfCurrentMonth &&
//               dueDate &&
//               dueDate < startOfCurrentMonth
//             );
//           } else if (paidStatus === "Pending") {
//             // Filter for pending EMIs before the current month
//             return (
//               emi.status === "Pending" &&
//               dueDate &&
//               dueDate < startOfCurrentMonth
//             );
//           } else {
//             // Return all EMIs (both paid and pending)
//             return (
//               (emi.status === "Paid" &&
//                 paidDate >= startOfCurrentMonth &&
//                 paidDate <= endOfCurrentMonth &&
//                 dueDate &&
//                 dueDate < startOfCurrentMonth) ||
//               (emi.status === "Pending" &&
//                 dueDate &&
//                 dueDate < startOfCurrentMonth)
//             );
//           }
//         });

//         if (filteredEMIs.length > 0) {
//           filteredEMIs.forEach((emi) =>
//             emiList.push(formatUserPlanResponse(user, plan, emi, emiData))
//           );
//         }
//       }
//     }
//   }

//   res.status(200).json({
//     status: true,
//     message: "EMI list retrieved successfully.",
//     data: emiList,
//   });
// });

// // Helper function to format user plan response
// function formatUserPlanResponse(user, plan, emi, emiData) {
//   const remainingPendingPayments = emiData.emiList.filter(
//     (emi) => emi.status === "Pending"
//   ).length;

//   let walletAmount = emiData.emiList.reduce(
//     (total, emi) =>
//       emi.status === "Paid" ? total + plan.commitedAmount : total,
//     0
//   );

//   // Include reward amount if 11 payments are made
//   if (emiData.emiList.filter((emi) => emi.status === "Paid").length === 11) {
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


/* eslint-disable no-else-return */
const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson");
const User = require("../../../models/user");
const Plan = require("../../../models/plan");
const UserAssign = require("../../../models/userAssign");
const CollectionAgent = require("../../../models/collectionAgent");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getPreviousEMIList = catchAsync(async (req, res, next) => {
  const {
    collectionAgent,
    salePerson,
    userId,
    plan,
    paidStatus,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  // Convert page and limit to integers and ensure they're positive
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

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

  // Validate paidStatus
  if (paidStatus && !["Paid", "Pending"].includes(paidStatus)) {
    return next(new AppError("Invalid paidStatus. Use 'Paid' or 'Pending'.", 400));
  }

  // Set date range for current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
  startOfCurrentMonth.setUTCHours(0, 0, 0, 0);
  endOfCurrentMonth.setUTCHours(23, 59, 59, 999);

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
        data: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNum,
          hasNextPage: false,
          hasPreviousPage: false,
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
        data: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNum,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    }
  }

  const emiList = [];

  // Process EMI records
  for (const plan of filteredPlans) {
    const emiData = await EmiList.findOne({ userPlan: plan._id });
    if (emiData && emiData.emiList.length > 0) {
      const filteredEMIs = emiData.emiList.filter((emi) => {
        const dueDate = emi.dueDate ? new Date(emi.dueDate) : null;
        const paidDate = emi.paidDate ? new Date(emi.paidDate) : null;

        if (paidStatus === "Paid") {
          return (
            emi.status === "Paid" &&
            paidDate &&
            paidDate >= startOfCurrentMonth &&
            paidDate <= endOfCurrentMonth &&
            dueDate &&
            dueDate < startOfCurrentMonth
          );
        } else if (paidStatus === "Pending") {
          return (
            emi.status === "Pending" &&
            dueDate &&
            dueDate < startOfCurrentMonth
          );
        } else {
          return (
            (emi.status === "Paid" &&
              paidDate &&
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

      filteredEMIs.forEach((emi) => {
        emiList.push(
          formatUserPlanResponse(plan.user, plan, emi, emiData)
        );
      });
    }
  }

  // Calculate pagination metadata
  const totalCount = emiList.length;
  const paginatedEMIs = emiList.slice(skip, skip + limitNum);
  const totalPages = Math.ceil(totalCount / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPreviousPage = pageNum > 1;

  res.status(200).json({
    status: true,
    message: "EMI list retrieved successfully.",
    data: paginatedEMIs,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalItems: totalCount,
      itemsPerPage: limitNum,
      hasNextPage,
      hasPreviousPage,
    },
  });
});

// Helper function to format user plan response
function formatUserPlanResponse(user, plan, emi, emiData) {
  const remainingPendingPayments = emiData.emiList.filter(
    (emi) => emi.status === "Pending"
  ).length;

  let walletAmount = emiData.emiList.reduce(
    (total, emi) =>
      emi.status === "Paid" ? total + (plan.commitedAmount || 0) : total,
    0
  );

  if (emiData.emiList.filter((emi) => emi.status === "Paid").length === 11) {
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