const UserPlan = require("../../../models/userPlan");
const PlanDock = require("../../../models/planDock");
const EmiList = require("../../../models/emiList");
const UserAssign = require("../../../models/userAssign");
const SalePerson = require("../../../models/salePerson");
const User = require("../../../models/user");
const CollectionAgent = require("../../../models/collectionAgent");
const StoreAssign = require("../../../models/storeAssign");
const mongoose = require("mongoose");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");

exports.getAllPendingRedemption = catchAsync(async (req, res, next) => {
  const {
    collectionAgent,
    salePerson,
    userId,
    planDock,
    search,
    dateFilter,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    storeIds,
    salePersonIds,
  } = req.body;

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

  if (planDock) {
    const planDockExists = await PlanDock.findById(planDock);
    if (!planDockExists) {
      return next(new AppError("Invalid planDock ID.", 400));
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
  } else if (startDate || endDate) {
    // Fallback to explicit startDate/endDate
    if (startDate) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
    }
    if (endDate) {
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    }
  } else {
    // No date filter
    start = null;
    end = null;
  }

  // Build UserPlan filter
  const filter = {
    isRedem: false,
  };

  // Apply date filters
  if (start) {
    filter.planStartDate = { $gte: start };
  }

  if (end) {
    filter.planEndDate = { $lte: end };
  }

  // Apply ObjectId filters
  if (salePerson) {
    const salePersonDoc = await SalePerson.findById(salePerson);
    filter.salePersonId = salePersonDoc.userId;
  }

  if (userId) {
    filter.user = userId;
  }

  if (planDock) {
    filter.planDock = planDock;
  }

  // Handle storeIds and salePersonIds filters
  let userIds = [];
  if (
    (storeIds && storeIds.length > 0) ||
    (salePersonIds && salePersonIds.length > 0)
  ) {
    let storeUserIds = [];
    let salePersonUserIds = [];

    // Handle storeIds filter
    if (storeIds && storeIds.length > 0) {
      const storeIdsArray = Array.isArray(storeIds)
        ? storeIds
        : storeIds.split(",").map((id) => id.trim());

      // Validate storeIds format
      if (!storeIdsArray.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        return next(new AppError("Invalid store ID format.", 400));
      }

      // Find store assignments for the given store IDs
      const storeAssigns = await StoreAssign.find({
        store: { $in: storeIdsArray },
      }).populate("salePerson");

      if (!storeAssigns || storeAssigns.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No store assignments found for the provided store IDs.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: [],
        });
      }

      // Collect all salePerson userIds
      const storeSalePersonIds = [
        ...new Set(
          storeAssigns
            .flatMap((storeAssign) => storeAssign.salePerson)
            .filter((sp) => sp)
            .map((sp) => sp.userId)
        ),
      ];

      if (storeSalePersonIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No sale persons found for these stores.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: [],
        });
      }

      // Find user plans for the collected salePerson userIds
      const storeUserPlans = await UserPlan.find({
        salePersonId: { $in: storeSalePersonIds },
        isRedem: false,
      });

      // Extract unique user IDs
      storeUserIds = [
        ...new Set(storeUserPlans.map((plan) => plan.user.toString())),
      ];

      if (storeUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No pending redemption plans found for these stores.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: [],
        });
      }
    }

    // Handle salePersonIds filter
    if (salePersonIds && salePersonIds.length > 0) {
      const salePersonIdsArray = Array.isArray(salePersonIds)
        ? salePersonIds
        : salePersonIds.split(",").map((id) => id.trim());

      // Validate salePersonIds by checking SalePerson collection
      const validSalePersons = await SalePerson.find({
        userId: { $in: salePersonIdsArray },
      }).select("userId");

      const validSalePersonIds = validSalePersons.map((sp) => sp.userId);

      if (validSalePersonIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No valid sale persons found for the provided IDs.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: [],
        });
      }

      // Find user plans for the collected salePerson userIds
      const salePersonUserPlans = await UserPlan.find({
        salePersonId: { $in: validSalePersonIds },
        isRedem: false,
      });

      // Extract unique user IDs
      salePersonUserIds = [
        ...new Set(salePersonUserPlans.map((plan) => plan.user.toString())),
      ];

      if (salePersonUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No pending redemption plans found for these sale persons.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: [],
        });
      }
    }

    // Combine filters: intersect user IDs if both storeIds and salePersonIds are provided
    if (
      storeIds &&
      storeIds.length > 0 &&
      salePersonIds &&
      salePersonIds.length > 0
    ) {
      userIds = storeUserIds.filter((id) => salePersonUserIds.includes(id));
    } else if (storeIds && storeIds.length > 0) {
      userIds = storeUserIds;
    } else {
      userIds = salePersonUserIds;
    }

    if (userIds.length === 0) {
      return res.status(200).json({
        status: true,
        message:
          "No pending redemption plans found matching the provided filters.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage) || 1,
        results: 0,
        data: [],
      });
    }

    // Add user IDs to filter
    filter.user = { $in: userIds };
  }

  // Handle collectionAgent filter
  if (collectionAgent) {
    const assignments = await UserAssign.find({ collectionAgent });
    const collectionAgentUserIds = assignments
      .map((assignment) => assignment.user)
      .filter(Boolean);
    if (collectionAgentUserIds.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No users found for this collection agent.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage) || 1,
        results: 0,
        data: [],
      });
    }
    // Intersect with existing user filter if present
    if (filter.user) {
      filter.user.$in = filter.user.$in.filter((id) =>
        collectionAgentUserIds.includes(id)
      );
      if (filter.user.$in.length === 0) {
        return res.status(200).json({
          status: true,
          message:
            "No pending redemption plans found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: [],
        });
      }
    } else {
      filter.user = { $in: collectionAgentUserIds };
    }
  }

  // Find plans with exactly 11 paid EMIs
  const userPlansWithElevenEMIs = await EmiList.aggregate([
    {
      $match: {
        "emiList.status": "Paid",
      },
    },
    {
      $unwind: "$emiList",
    },
    {
      $match: { "emiList.status": "Paid" },
    },
    {
      $group: {
        _id: "$userPlan",
        paidCount: { $sum: 1 },
      },
    },
    {
      $match: { paidCount: 11 },
    },
    {
      $project: { _id: 1 },
    },
  ]);

  const eligibleUserPlanIds = userPlansWithElevenEMIs.map((plan) => plan._id);

  if (eligibleUserPlanIds.length === 0) {
    return res.status(200).json({
      status: true,
      totalResult: 0,
      totalPage: 0,
      currentPage: parseInt(currentPage) || 1,
      results: 0,
      data: [],
    });
  }

  // Intersect with eligibleUserPlanIds
  filter._id = { $in: eligibleUserPlanIds };

  // Build search filter
  let userMatch = {};
  let planDockMatch = {};
  let collectionAgentMatch = {};
  let salePersonMatch = {};

  if (search) {
    const searchRegex = new RegExp(search, "i");

    // User name or mobile
    userMatch = {
      $or: [{ name: searchRegex }, { mobile: searchRegex }],
    };

    // CollectionAgent name
    const collectionAgents = await CollectionAgent.find({ name: searchRegex });
    const collectionAgentIds = collectionAgents.map((ca) => ca._id);
    if (collectionAgentIds.length > 0) {
      const assignments = await UserAssign.find({
        collectionAgent: { $in: collectionAgentIds },
      });
      const collectionAgentUserIds = assignments
        .map((a) => a.user)
        .filter(Boolean);
      if (collectionAgentUserIds.length > 0) {
        collectionAgentMatch = { _id: { $in: collectionAgentUserIds } };
      }
    }

    // SalePerson name
    const salePersons = await SalePerson.find({ name: searchRegex });
    const salePersonUserIds = salePersons.map((sp) => sp.userId);
    if (salePersonUserIds.length > 0) {
      salePersonMatch = { salePersonId: { $in: salePersonUserIds } };
    }

    // PlanDock name
    planDockMatch = { name: searchRegex };
  }

  // Apply pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    UserPlan,
    null,
    filter
  );

  // Fetch pending redemptions
  const pendingRedemptions = await UserPlan.find({
    ...filter,
    ...(Object.keys(salePersonMatch).length > 0 ? salePersonMatch : {}),
  })
    .populate({
      path: "user",
      match: {
        ...(Object.keys(userMatch).length > 0 ? userMatch : {}),
        ...(Object.keys(collectionAgentMatch).length > 0
          ? collectionAgentMatch
          : {}),
      },
    })
    .populate({
      path: "planDock",
      match: Object.keys(planDockMatch).length > 0 ? planDockMatch : {},
    })
    .populate("plan", "name")
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  // Filter out plans where user or planDock is null and add storeLocation and salePersonName
  const filteredPlans = await Promise.all(
    pendingRedemptions
      .filter((plan) => plan.user && plan.planDock)
      .map(async (plan) => {
        // Fetch SalePerson for salePersonName
        const salePersonDoc = await SalePerson.findOne({
          userId: plan.salePersonId,
        })
          .select("name _id userId")
          .lean();

        // Fetch StoreAssign for storeLocation
        let storeLocation = "";
        if (salePersonDoc) {
          const storeAssign = await StoreAssign.findOne({
            salePerson: salePersonDoc._id,
          })
            .populate({
              path: "store",
              select: "location",
              populate: {
                path: "location",
                select: "name",
              },
            })
            .lean();

          if (storeAssign && storeAssign.store && storeAssign.store.location) {
            storeLocation = storeAssign.store.location.name || "";
          }
        }

        // Convert plan to plain object and add new fields
        const planObject = plan.toObject();
        return {
          ...planObject,
          salePersonName: salePersonDoc ? salePersonDoc.name : "",
          salePersonId: salePersonDoc ? salePersonDoc.userId : "",
          storeLocation,
        };
      })
  );

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: parseInt(currentPage) || 1,
    results: filteredPlans.length,
    data: filteredPlans,
  });
});
