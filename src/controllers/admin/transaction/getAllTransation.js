// const Transaction = require("../../../models/transaction");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");

// exports.getAllTransaction = catchAsync(async (req, res) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//   } = req.query;

//   const filter = {};

//   if (search) {
//     filter.name = { $regex: search, $options: "i" };
//   }
//   if (status) {
//     filter.status = status;
//   }

//   if (startDate) {
//     filter.createdAt = { $gte: new Date(startDate) };
//   }
//   if (endDate) {
//     filter.createdAt = { $lte: new Date(endDate) };
//   }

//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     Transaction,
//     null,
//     filter
//   );
//   const transaction = await Transaction.find(filter)
//     .populate("user", "name mobile email")
//     .populate("userPlan")
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: transaction.length,
//     data: {
//       transaction: transaction,
//     },
//   });
// });

const mongoose = require("mongoose");
const Transaction = require("../../../models/transaction");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson");
const StoreAssign = require("../../../models/storeAssign");
const UserAssign = require("../../../models/userAssign");
const EmiList = require("../../../models/emiList");
const CollectionAgent = require("../../../models/collectionAgent");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getAllTransaction = catchAsync(async (req, res, next) => {
  const {
    search,
    dateFilter,
    startDate,
    endDate,
    status,
    userId,
    planDock,
    collectionAgent,
    storeIds,
    salePersonIds,
    page: currentPage = 1,
    limit: currentLimit = 10,
  } = req.body;

  // Initialize filter object
  const filter = {};

  // Validate ObjectId filters
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError("Invalid user ID format.", 400));
    }
    filter.user = new mongoose.Types.ObjectId(userId);
  }

  if (planDock) {
    if (!mongoose.Types.ObjectId.isValid(planDock)) {
      return next(new AppError("Invalid planDock ID format.", 400));
    }
    // Filter transactions where userPlan.planDock matches
    const userPlans = await UserPlan.find({ planDock }).select("_id");
    if (userPlans.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No transactions found for this planDock.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: { transaction: [] },
      });
    }
    filter.userPlan = { $in: userPlans.map((up) => up._id) };
  }

  // Status Filter
  if (status) {
    if (!["Success", "Failed", "Pending"].includes(status)) {
      return next(new AppError("Invalid status.", 400));
    }
    filter.status = status;
  }

  // Date Filter Logic using createdAt
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
    // Backward compatibility
    if (startDate) {
      start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0);
    }
    if (endDate) {
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    }
  }

  // Apply date filters
  if (start) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$gte = start;
  }
  if (end) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = end;
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

      // Find store assignments
      const storeAssigns = await StoreAssign.find({
        store: { $in: storeIdsArray },
      }).populate("salePerson");

      if (!storeAssigns || storeAssigns.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No store assignments found for the provided store IDs.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: { transaction: [] },
        });
      }

      // Collect salePerson userIds
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
          currentPage: parseInt(currentPage),
          results: 0,
          data: { transaction: [] },
        });
      }

      // Find user plans
      const storeUserPlans = await UserPlan.find({
        salePersonId: { $in: storeSalePersonIds },
      }).select("user");

      storeUserIds = [
        ...new Set(storeUserPlans.map((plan) => plan.user.toString())),
      ];

      if (storeUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No user plans found for these stores.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: { transaction: [] },
        });
      }
    }

    // Handle salePersonIds filter
    if (salePersonIds && salePersonIds.length > 0) {
      const salePersonIdsArray = Array.isArray(salePersonIds)
        ? salePersonIds
        : salePersonIds.split(",").map((id) => id.trim());

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
          currentPage: parseInt(currentPage),
          results: 0,
          data: { transaction: [] },
        });
      }

      const salePersonUserPlans = await UserPlan.find({
        salePersonId: { $in: validSalePersonIds },
      }).select("user");

      salePersonUserIds = [
        ...new Set(salePersonUserPlans.map((plan) => plan.user.toString())),
      ];

      if (salePersonUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No user plans found for these sale persons.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: { transaction: [] },
        });
      }
    }

    // Combine filters
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
        message: "No transactions found matching the provided filters.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: { transaction: [] },
      });
    }

    filter.user = { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  // Collection Agent Filter
  if (collectionAgent) {
    if (!mongoose.Types.ObjectId.isValid(collectionAgent)) {
      return next(new AppError("Invalid collection agent ID format.", 400));
    }
    const userAssignments = await UserAssign.find({ collectionAgent });
    if (!userAssignments.length) {
      return res.status(200).json({
        status: true,
        message: "No users assigned to this collection agent.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: { transaction: [] },
      });
    }
    const collectionAgentUserIds = userAssignments.map((ua) => ua.user);
    if (filter.user) {
      filter.user.$in = filter.user.$in.filter((id) =>
        collectionAgentUserIds.some((cid) => cid.equals(id))
      );
      if (filter.user.$in.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No transactions found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: { transaction: [] },
        });
      }
    } else {
      filter.user = { $in: collectionAgentUserIds };
    }
  }

  // Search Filter Logic
  let userMatch = {};
  let planDockMatch = {};
  if (search) {
    userMatch = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ],
    };
    planDockMatch = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ],
    };

    // Search SalePerson fields
    const matchingSalePersons = await SalePerson.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { userId: { $regex: search, $options: "i" } },
      ],
    }).select("userId");

    if (matchingSalePersons.length > 0) {
      const salePersonUserPlans = await UserPlan.find({
        salePersonId: { $in: matchingSalePersons.map((sp) => sp.userId) },
      }).select("user");
      const salePersonUserIds = [
        ...new Set(salePersonUserPlans.map((plan) => plan.user.toString())),
      ];
      if (salePersonUserIds.length > 0) {
        if (filter.user) {
          filter.user.$in = filter.user.$in.filter((id) =>
            salePersonUserIds.includes(id.toString())
          );
          if (filter.user.$in.length === 0) {
            return res.status(200).json({
              status: true,
              message: "No transactions found matching the search criteria.",
              totalResult: 0,
              totalPage: 0,
              currentPage: parseInt(currentPage),
              results: 0,
              data: { transaction: [] },
            });
          }
        } else {
          filter.user = {
            $in: salePersonUserIds.map((id) => new mongoose.Types.ObjectId(id)),
          };
        }
      }
    }

    // Search CollectionAgent name
    const matchingCollectionAgents = await CollectionAgent.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");
    if (matchingCollectionAgents.length > 0) {
      const assignments = await UserAssign.find({
        collectionAgent: { $in: matchingCollectionAgents.map((ca) => ca._id) },
      });
      const collectionAgentUserIds = assignments
        .map((a) => a.user)
        .filter(Boolean);
      if (collectionAgentUserIds.length > 0) {
        if (filter.user) {
          filter.user.$in = filter.user.$in.filter((id) =>
            collectionAgentUserIds.some((cid) => cid.equals(id))
          );
          if (filter.user.$in.length === 0) {
            return res.status(200).json({
              status: true,
              message: "No transactions found matching the search criteria.",
              totalResult: 0,
              totalPage: 0,
              currentPage: parseInt(currentPage),
              results: 0,
              data: { transaction: [] },
            });
          }
        } else {
          filter.user = { $in: collectionAgentUserIds };
        }
      }
    }
  }

  // Calculate paid EMIs and total paid amount
  const emiDetails = await EmiList.aggregate([
    {
      $match: { "emiList.status": "Paid" },
    },
    { $unwind: "$emiList" },
    { $match: { "emiList.status": "Paid" } },
    {
      $group: {
        _id: "$userPlan",
        paidEmiCount: { $sum: 1 },
        totalPaidAmount: { $sum: "$emiList.monthlyAdvance" },
      },
    },
  ]);

  const emiDetailsMap = emiDetails.reduce((map, item) => {
    map[item._id.toString()] = {
      paidEmiCount: item.paidEmiCount,
      totalPaidAmount: item.totalPaidAmount,
    };
    return map;
  }, {});

  // Calculate total active plans per user
  const activePlansCount = await UserPlan.aggregate([
    { $match: { status: "Active" } },
    {
      $group: {
        _id: "$user",
        totalActivePlans: { $sum: 1 },
      },
    },
  ]);

  const activePlansMap = activePlansCount.reduce((map, item) => {
    map[item._id.toString()] = item.totalActivePlans;
    return map;
  }, {});

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    Transaction,
    null,
    filter
  );

  // Fetch transactions
  const transactions = await Transaction.find(filter)
    .populate({
      path: "user",
      select: "name email mobile city state country redemptionDate",
      match: userMatch,
    })
    .populate({
      path: "userPlan",
      populate: {
        path: "planDock",
        match: planDockMatch,
        populate:{
          path:"plan",
          select:"name"
        }
      },
    })
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  // Filter out invalid transactions and add additional fields
  const filteredTransactions = await Promise.all(
    transactions
      .filter((txn) => txn.user && txn.userPlan && txn.userPlan.planDock)
      .map(async (txn) => {
        // Fetch SalePerson
        const salePersonDoc = await SalePerson.findOne({
          userId: txn.userPlan.salePersonId,
        })
          .select("name _id userId")
          .lean();

        // Fetch StoreAssign
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

        // Get EMI details
        const emiInfo = emiDetailsMap[txn.userPlan._id.toString()] || {
          paidEmiCount: 0,
          totalPaidAmount: 0,
        };

        // Get total active plans
        const totalActivePlans = txn.user
          ? activePlansMap[txn.user._id.toString()] || 0
          : 0;

        // Convert to plain object and add fields
        const txnObject = txn.toObject();
        return {
          ...txnObject,
          salePersonName: salePersonDoc ? salePersonDoc.name : "",
          salePersonId: salePersonDoc ? salePersonDoc.userId : "",
          storeLocation,
          paidEmiCount: emiInfo.paidEmiCount,
          totalPaidAmount: emiInfo.totalPaidAmount,
          totalActivePlans,
        };
      })
  );

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: parseInt(currentPage),
    results: filteredTransactions.length,
    data: {
      transaction: filteredTransactions,
    },
  });
});
