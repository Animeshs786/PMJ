const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson");
const User = require("../../../models/user");
const Plan = require("../../../models/plan");
const UserAssign = require("../../../models/userAssign");
const CollectionAgent = require("../../../models/collectionAgent");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getTotalTargetUsersForAdmin = catchAsync(async (req, res, next) => {
  const {
    collectionAgent,
    salePerson,
    userId,
    plan,
    dateFilter,
    startDate,
    endDate,
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

  // Date Filter Logic
  let start, end;
  if (dateFilter) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([0, 1, 2].includes(currentMonth)) {
          start = new Date(currentYear, 0, 1); // Jan 1
          end = new Date(currentYear, 2, 31); // Mar 31
        } else if ([3, 4, 5].includes(currentMonth)) {
          start = new Date(currentYear, 3, 1); // Apr 1
          end = new Date(currentYear, 5, 30); // Jun 30
        } else if ([6, 7, 8].includes(currentMonth)) {
          start = new Date(currentYear, 6, 1); // Jul 1
          end = new Date(currentYear, 8, 30); // Sep 30
        } else {
          start = new Date(currentYear, 9, 1); // Oct 1
          end = new Date(currentYear, 11, 31); // Dec 31
        }
        break;

      case "MTD":
        start = new Date(currentYear, currentMonth, 1); // First day
        end = new Date(currentYear, currentMonth + 1, 0); // Last day
        break;

      case "YTD":
        if (currentMonth >= 3) {
          start = new Date(currentYear, 3, 1); // Apr 1
          end = new Date(currentYear + 1, 2, 31); // Mar 31 next year
        } else {
          start = new Date(currentYear - 1, 3, 1); // Apr 1 previous
          end = new Date(currentYear, 2, 31); // Mar 31 current
        }
        break;

      case "CUSTOM":
        if (!startDate || !endDate) {
          return next(
            new AppError(
              "Both startDate and endDate are required for custom filter.",
              400
            )
          );
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;

      default:
        return next(new AppError("Invalid date filter.", 400));
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
  } else {
    const now = new Date();
    start = new Date(0); // Earliest possible date
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

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
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
        overdueUsers: [],
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
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
        overdueUsers: [],
      });
    }
  }

  const targetUsers = [];

  // Process EMI records
  for (const plan of filteredPlans) {
    const emiRecords = await EmiList.findOne({ userPlan: plan._id });
    if (emiRecords && emiRecords.emiList.length > 0) {
      emiRecords.emiList.forEach((emi) => {
        const dueDate = new Date(emi.dueDate);
        if (dueDate >= start && dueDate <= end && emi.status === "Pending") {
          targetUsers.push({
            _id: emiRecords.userPlan,
            commitedAmount: emi.monthlyAdvance || plan.commitedAmount || 0,
            userName: plan.user?.name || "Unknown",
            mobile: plan.user?.mobile || "Unknown",
            dueDate: emi.dueDate.toISOString().split("T")[0],
          });
        }
      });
    }
  }

  // Pagination
  const total = targetUsers.length;
  const paginatedTargetUsers = targetUsers.slice(skip, skip + limitNum);
  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPreviousPage = pageNum > 1;

  res.status(200).json({
    status: true,
    message: "Total overdue users retrieved successfully.",
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    overdueUsers: paginatedTargetUsers,
  });
});