// const UserPlan = require("../../../models/userPlan");
// const SalePerson = require("../../../models/salePerson");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");
// const AppError = require("../../../utils/AppError");

// exports.getAllActiveUsersForAdmin = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     dateFilter,
//     startDate,
//     endDate,
//     salePerson,
//     page: currentPage = 1,
//     limit: currentLimit = 10,
//   } = req.body;

//   // Initialize filter object
//   const filter = {
//     status: "Active",
//   };

//   // SalePerson Filter
//   if (salePerson) {
//     const salePersonExists = await SalePerson.findOne({ userId: salePerson });
//     if (!salePersonExists) {
//       return next(new AppError("Invalid salePerson.", 400));
//     }
//     filter.salePersonId = salePerson;
//   }

//   // Date Filter Logic using createdAt
//   let start, end;

//   if (dateFilter) {
//     const now = new Date();
//     const currentMonth = now.getMonth();
//     const currentYear = now.getFullYear();

//     switch (dateFilter.toUpperCase()) {
//       case "QTD":
//         if ([0, 1, 2].includes(currentMonth)) {
//           // Q1: January, February, March
//           start = new Date(currentYear, 0, 1); // January 1st
//           end = new Date(currentYear, 2, 31); // March 31st
//         } else if ([3, 4, 5].includes(currentMonth)) {
//           // Q2: April, May, June
//           start = new Date(currentYear, 3, 1); // April 1st
//           end = new Date(currentYear, 5, 30); // June 30th
//         } else if ([6, 7, 8].includes(currentMonth)) {
//           // Q3: July, August, September
//           start = new Date(currentYear, 6, 1); // July 1st
//           end = new Date(currentYear, 8, 30); // September 30th
//         } else {
//           // Q4: October, November, December
//           start = new Date(currentYear, 9, 1); // October 1st
//           end = new Date(currentYear, 11, 31); // December 31st
//         }
//         break;

//       case "MTD":
//         start = new Date(currentYear, currentMonth, 1); // First day of the current month
//         end = new Date(currentYear, currentMonth + 1, 0); // Last day of the current month
//         break;

//       case "YTD":
//         if (currentMonth >= 3) {
//           // Current year from April to March
//           start = new Date(currentYear, 3, 1); // April 1st
//           end = new Date(currentYear + 1, 2, 31); // March 31st of the next year
//         } else {
//           // Previous year from April to March
//           start = new Date(currentYear - 1, 3, 1); // April 1st of the previous year
//           end = new Date(currentYear, 2, 31); // March 31st of the current year
//         }
//         break;

//       case "CUSTOM":
//         if (!startDate || !endDate) {
//           return next(
//             new AppError(
//               "Both startDate and endDate are required for custom filter.",
//               400
//             )
//           );
//         }
//         start = new Date(startDate);
//         end = new Date(endDate);
//         break;

//       default:
//         return next(new AppError("Invalid date filter.", 400));
//     }

//     // Set time for start and end of the day
//     start.setUTCHours(0, 0, 0, 0);
//     end.setUTCHours(23, 59, 59, 999);

//     // Apply date filter to createdAt
//     filter.createdAt = { $gte: start, $lte: end };
//   } else {
//     // Backward compatibility for startDate and endDate
//     if (startDate) {
//       filter.createdAt = filter.createdAt || {};
//       filter.createdAt.$gte = new Date(startDate);
//     }
//     if (endDate) {
//       filter.createdAt = filter.createdAt || {};
//       filter.createdAt.$lte = new Date(endDate);
//     }
//   }

//   // Search Filter Logic for User (name, email, mobile), PlanDock (name, email, mobile), and SalePerson (name, email, mobile, userId)
//   let userMatch = {};
//   let planDockMatch = {};
//   if (search) {
//     userMatch = {
//       $or: [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { mobile: { $regex: search, $options: "i" } },
//       ],
//     };
//     planDockMatch = {
//       $or: [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { mobile: { $regex: search, $options: "i" } },
//       ],
//     };

//     // Search SalePerson fields (skip if salePersonId is provided)
//     if (!salePerson) {
//       const matchingSalePersons = await SalePerson.find({
//         $or: [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//           { mobile: { $regex: search, $options: "i" } },
//           { userId: { $regex: search, $options: "i" } },
//         ],
//       }).select("userId");

//       if (matchingSalePersons.length > 0) {
//         filter.salePersonId = {
//           $in: matchingSalePersons.map((sp) => sp.userId),
//         };
//       }
//     }
//   }

//   // Pagination
//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     UserPlan,
//     null,
//     filter
//   );

//   // Fetch active user plans
//   const activeUserPlans = await UserPlan.find(filter)
//     .populate({
//       path: "user",
//       select: "name email mobile city state country",
//       match: userMatch,
//     })
//     .populate({
//       path: "planDock",
//       select: "name email mobile",
//       match: planDockMatch,
//     })
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   // Filter out plans where user is null
//   const filteredPlans = activeUserPlans.filter((plan) => plan.user);

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: parseInt(currentPage),
//     results: filteredPlans.length,
//     data: filteredPlans,
//   });
// });


const mongoose = require("mongoose");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson");
const StoreAssign = require("../../../models/storeAssign");
const UserAssign = require("../../../models/userAssign");
const EmiList = require("../../../models/emiList");
const CollectionAgent = require("../../../models/collectionAgent");
const User = require("../../../models/user");
const PlanDock = require("../../../models/planDock");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getAllActiveUsersForAdmin = catchAsync(async (req, res, next) => {
  const {
    search,
    dateFilter,
    startDate,
    endDate,
    salePersonId,
    userId,
    planDock,
    collectionAgent,
    storeIds,
    salePersonIds,
    page: currentPage = 1,
    limit: currentLimit = 10,
  } = req.body;

  // Initialize filter object
  const filter = {
    status: "Active",
  };

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
    filter.planDock = new mongoose.Types.ObjectId(planDock);
  }

  // SalePerson Filter
  if (salePersonId) {
    const salePersonExists = await SalePerson.findOne({ userId: salePersonId });
    if (!salePersonExists) {
      return next(new AppError("Invalid salePerson.", 400));
    }
    filter.salePersonId = salePersonId;
  }

  // Date Filter Logic using planStartDate and planEndDate
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
    // Backward compatibility for startDate/endDate
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

  // Apply date filters
  if (start) {
    filter.planStartDate = { $gte: start };
  }
  if (end) {
    filter.planEndDate = { $lte: end };
  }

  // Handle storeIds and salePersonIds filters
  let userIds = [];
  if ((storeIds && storeIds.length > 0) || (salePersonIds && salePersonIds.length > 0)) {
    let storeUserIds = [];
    let salePersonUserIds = [];

    // Handle storeIds filter
    if (storeIds && storeIds.length > 0) {
      const storeIdsArray = Array.isArray(storeIds) ? storeIds : storeIds.split(",").map(id => id.trim());

      // Validate storeIds format
      if (!storeIdsArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
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
          currentPage: parseInt(currentPage),
          results: 0,
          data: [],
        });
      }

      // Collect all salePerson userIds
      const storeSalePersonIds = [...new Set(
        storeAssigns
          .flatMap((storeAssign) => storeAssign.salePerson)
          .filter(sp => sp)
          .map((sp) => sp.userId)
      )];

      if (storeSalePersonIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No sale persons found for these stores.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: [],
        });
      }

      // Find user plans for the collected salePerson userIds
      const storeUserPlans = await UserPlan.find({
        salePersonId: { $in: storeSalePersonIds },
        status: "Active",
      }).select("user");

      // Extract unique user IDs
      storeUserIds = [...new Set(storeUserPlans.map((plan) => plan.user.toString()))];

      if (storeUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No active user plans found for these stores.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: [],
        });
      }
    }

    // Handle salePersonIds filter
    if (salePersonIds && salePersonIds.length > 0) {
      const salePersonIdsArray = Array.isArray(salePersonIds) ? salePersonIds : salePersonIds.split(",").map(id => id.trim());

      // Validate salePersonIds by checking SalePerson collection
      const validSalePersons = await SalePerson.find({
        userId: { $in: salePersonIdsArray },
      }).select("userId");

      const validSalePersonIds = validSalePersons.map(sp => sp.userId);

      if (validSalePersonIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No valid sale persons found for the provided IDs.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: [],
        });
      }

      // Find user plans for the collected salePerson userIds
      const salePersonUserPlans = await UserPlan.find({
        salePersonId: { $in: validSalePersonIds },
        status: "Active",
      }).select("user");

      // Extract unique user IDs
      salePersonUserIds = [...new Set(salePersonUserPlans.map((plan) => plan.user.toString()))];

      if (salePersonUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No active user plans found for these sale persons.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: [],
        });
      }
    }

    // Combine filters: intersect user IDs if both storeIds and salePersonIds are provided
    if (storeIds && storeIds.length > 0 && salePersonIds && salePersonIds.length > 0) {
      userIds = storeUserIds.filter((id) => salePersonUserIds.includes(id));
    } else if (storeIds && storeIds.length > 0) {
      userIds = storeUserIds;
    } else {
      userIds = salePersonUserIds;
    }

    if (userIds.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No active user plans found matching the provided filters.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: [],
      });
    }

    // Add user IDs to filter
    filter.user = { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) };
  }

  // Collection Agent Filter: Intersect with existing user filter if present
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
        data: [],
      });
    }
    const collectionAgentUserIds = userAssignments.map((ua) => ua.user);
    if (filter.user) {
      filter.user.$in = filter.user.$in.filter(id => collectionAgentUserIds.some(cid => cid.equals(id)));
      if (filter.user.$in.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No active user plans found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: [],
        });
      }
    } else {
      filter.user = { $in: collectionAgentUserIds };
    }
  }

  // Search Filter Logic for User, PlanDock, SalePerson, and CollectionAgent
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

    // Search SalePerson fields (skip if salePersonId is provided)
    if (!salePersonId) {
      const matchingSalePersons = await SalePerson.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { userId: { $regex: search, $options: "i" } },
        ],
      }).select("userId");

      if (matchingSalePersons.length > 0) {
        filter.salePersonId = {
          $in: matchingSalePersons.map((sp) => sp.userId),
        };
      }
    }

    // Search CollectionAgent name
    const matchingCollectionAgents = await CollectionAgent.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");
    if (matchingCollectionAgents.length > 0) {
      const assignments = await UserAssign.find({
        collectionAgent: { $in: matchingCollectionAgents.map(ca => ca._id) },
      });
      const collectionAgentUserIds = assignments.map((a) => a.user).filter(Boolean);
      if (collectionAgentUserIds.length > 0) {
        if (filter.user) {
          filter.user.$in = filter.user.$in.filter(id => collectionAgentUserIds.some(cid => cid.equals(id)));
          if (filter.user.$in.length === 0) {
            return res.status(200).json({
              status: true,
              message: "No active user plans found matching the search criteria.",
              totalResult: 0,
              totalPage: 0,
              currentPage: parseInt(currentPage),
              results: 0,
              data: [],
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
        paidEmiCount: { $sum: 1 },
        totalPaidAmount: { $sum: "$emiList.monthlyAdvance" },
      },
    },
  ]);

  // Create a map for quick lookup of EMI details
  const emiDetailsMap = emiDetails.reduce((map, item) => {
    map[item._id.toString()] = {
      paidEmiCount: item.paidEmiCount,
      totalPaidAmount: item.totalPaidAmount,
    };
    return map;
  }, {});

  // Calculate total active plans per user
  const activePlansCount = await UserPlan.aggregate([
    {
      $match: {
        status: "Active",
      },
    },
    {
      $group: {
        _id: "$user",
        totalActivePlans: { $sum: 1 },
      },
    },
  ]);

  // Create a map for quick lookup of total active plans
  const activePlansMap = activePlansCount.reduce((map, item) => {
    map[item._id.toString()] = item.totalActivePlans;
    return map;
  }, {});

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    UserPlan,
    null,
    filter
  );

  // Fetch active user plans
  const activeUserPlans = await UserPlan.find(filter)
    .populate({
      path: "user",
      select: "name email mobile city state country redemptionDate",
      match: userMatch,
    })
    .populate({
      path: "planDock",
      match: planDockMatch,
    })
    .populate({
      path: "plan",
    })
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  // Filter out plans where user is null and add additional fields
  const filteredPlans = await Promise.all(
    activeUserPlans
      .filter((plan) => plan.user)
      .map(async (plan) => {
        // Fetch SalePerson for salePersonName
        const salePersonDoc = await SalePerson.findOne({
          userId: plan.salePersonId,
        }).select("name _id userId").lean();

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

        // Get EMI details
        const emiInfo = emiDetailsMap[plan._id.toString()] || {
          paidEmiCount: 0,
          totalPaidAmount: 0,
        };

        // Get total active plans
        const totalActivePlans = plan.user ? activePlansMap[plan.user._id.toString()] || 0 : 0;

        // Convert plan to plain object and add new fields
        const planObject = plan.toObject();
        return {
          ...planObject,
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
    results: filteredPlans.length,
    data: filteredPlans,
  });
});