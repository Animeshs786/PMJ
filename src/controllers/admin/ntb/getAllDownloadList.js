

// const mongoose = require("mongoose");
// const Share = require("../../../models/share");
// const User = require("../../../models/user");
// const SalePerson = require("../../../models/salePerson");
// const StoreAssign = require("../../../models/storeAssign");
// const UserAssign = require("../../../models/userAssign");
// const UserPlan = require("../../../models/userPlan");
// const PlanDock = require("../../../models/planDock");
// const EmiList = require("../../../models/emiList");
// const CollectionAgent = require("../../../models/collectionAgent");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");
// const AppError = require("../../../utils/AppError");

// exports.getAllDownloadListForAdmin = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     dateFilter,
//     startDate,
//     endDate,
//     salePerson,
//     userId,
//     planDock,
//     collectionAgent,
//     storeIds,
//     salePersonIds,
//     page: currentPage = 1,
//     limit: currentLimit = 10,
//   } = req.body;

//   // Initialize filter object
//   const filter = {};

//   // Validate ObjectId filters
//   if (userId) {
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return next(new AppError("Invalid user ID format.", 400));
//     }
//     // Find users with matching userId to get their mobile numbers
//     const user = await User.findById(userId).select("mobile");
//     if (!user) {
//       return res.status(200).json({
//         status: true,
//         message: "No user found for the provided userId.",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         results: 0,
//         data: [],
//       });
//     }
//     filter.mobile = user.mobile;
//   }

//   if (planDock) {
//     if (!mongoose.Types.ObjectId.isValid(planDock)) {
//       return next(new AppError("Invalid planDock ID format.", 400));
//     }
//   }

//   // SalePerson Filter
//   if (salePerson) {
//     const salePersonExists = await SalePerson.findOne({ userId: salePerson });
//     if (!salePersonExists) {
//       return next(new AppError("Invalid salePerson.", 400));
//     }
//     filter.salePerson = salePersonExists._id;
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
//           start = new Date(currentYear, 0, 1); // Jan 1
//           end = new Date(currentYear, 2, 31); // Mar 31
//         } else if ([3, 4, 5].includes(currentMonth)) {
//           start = new Date(currentYear, 3, 1); // Apr 1
//           end = new Date(currentYear, 5, 30); // Jun 30
//         } else if ([6, 7, 8].includes(currentMonth)) {
//           start = new Date(currentYear, 6, 1); // Jul 1
//           end = new Date(currentYear, 8, 30); // Sep 30
//         } else {
//           start = new Date(currentYear, 9, 1); // Oct 1
//           end = new Date(currentYear, 11, 31); // Dec 31
//         }
//         break;

//       case "MTD":
//         start = new Date(currentYear, currentMonth, 1); // First day
//         end = new Date(currentYear, currentMonth + 1, 0); // Last day
//         break;

//       case "YTD":
//         if (currentMonth >= 3) {
//           start = new Date(currentYear, 3, 1); // Apr 1
//           end = new Date(currentYear + 1, 2, 31); // Mar 31 next year
//         } else {
//           start = new Date(currentYear - 1, 3, 1); // Apr 1 previous
//           end = new Date(currentYear, 2, 31); // Mar 31 current
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

//     start.setUTCHours(0, 0, 0, 0);
//     end.setUTCHours(23, 59, 59, 999);
//     filter.createdAt = { $gte: start, $lte: end };
//   } else if (startDate || endDate) {
//     if (startDate) {
//       filter.createdAt = filter.createdAt || {};
//       filter.createdAt.$gte = new Date(startDate);
//       filter.createdAt.$gte.setUTCHours(0, 0, 0, 0);
//     }
//     if (endDate) {
//       filter.createdAt = filter.createdAt || {};
//       filter.createdAt.$lte = new Date(endDate);
//       filter.createdAt.$lte.setUTCHours(23, 59, 59, 999);
//     }
//   }

//   // Handle storeIds and salePersonIds filters
//   let userMobiles = [];
//   if ((storeIds && storeIds.length > 0) || (salePersonIds && salePersonIds.length > 0)) {
//     let storeUserIds = [];
//     let salePersonUserIds = [];

//     // Handle storeIds filter
//     if (storeIds && storeIds.length > 0) {
//       const storeIdsArray = Array.isArray(storeIds) ? storeIds : storeIds.split(",").map(id => id.trim());

//       if (!storeIdsArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
//         return next(new AppError("Invalid store ID format.", 400));
//       }

//       const storeAssigns = await StoreAssign.find({
//         store: { $in: storeIdsArray },
//       }).populate("salePerson");

//       if (!storeAssigns || storeAssigns.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No store assignments found for the provided store IDs.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: [],
//         });
//       }

//       const storeSalePersonIds = [...new Set(
//         storeAssigns
//           .flatMap((storeAssign) => storeAssign.salePerson)
//           .filter(sp => sp)
//           .map((sp) => sp.userId)
//       )];

//       if (storeSalePersonIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No sale persons found for these stores.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: [],
//         });
//       }

//       const storeUserPlans = await UserPlan.find({
//         salePersonId: { $in: storeSalePersonIds },
//         status: "Active",
//       }).select("user");

//       storeUserIds = [...new Set(storeUserPlans.map((plan) => plan.user.toString()))];

//       if (storeUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No active user plans found for these stores.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: [],
//         });
//       }
//     }

//     // Handle salePersonIds filter
//     if (salePersonIds && salePersonIds.length > 0) {
//       const salePersonIdsArray = Array.isArray(salePersonIds) ? salePersonIds : salePersonIds.split(",").map(id => id.trim());

//       const validSalePersons = await SalePerson.find({
//         userId: { $in: salePersonIdsArray },
//       }).select("userId");

//       const validSalePersonIds = validSalePersons.map(sp => sp.userId);

//       if (validSalePersonIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No valid sale persons found for the provided IDs.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: [],
//         });
//       }

//       const salePersonUserPlans = await UserPlan.find({
//         salePersonId: { $in: validSalePersonIds },
//         status: "Active",
//       }).select("user");

//       salePersonUserIds = [...new Set(salePersonUserPlans.map((plan) => plan.user.toString()))];

//       if (salePersonUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No active user plans found for these sale persons.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: [],
//         });
//       }
//     }

//     // Combine filters: intersect user IDs if both storeIds and salePersonIds are provided
//     let userIds;
//     if (storeIds && storeIds.length > 0 && salePersonIds && salePersonIds.length > 0) {
//       userIds = storeUserIds.filter((id) => salePersonUserIds.includes(id));
//     } else if (storeIds && storeIds.length > 0) {
//       userIds = storeUserIds;
//     } else {
//       userIds = salePersonUserIds;
//     }

//     if (userIds.length === 0) {
//       return res.status(200).json({
//         status: true,
//         message: "No active user plans found matching the provided filters.",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         results: 0,
//         data: [],
//       });
//     }

//     // Convert user IDs to mobile numbers
//     const users = await User.find({ _id: { $in: userIds } }).select("mobile");
//     userMobiles = users.map(user => user.mobile);
//     if (userMobiles.length === 0) {
//       return res.status(200).json({
//         status: true,
//         message: "No users found for the provided store or sale person filters.",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         results: 0,
//         data: [],
//       });
//     }
//     filter.mobile = { $in: userMobiles };
//   }

//   // Collection Agent Filter
//   if (collectionAgent) {
//     if (!mongoose.Types.ObjectId.isValid(collectionAgent)) {
//       return next(new AppError("Invalid collection agent ID format.", 400));
//     }
//     const userAssignments = await UserAssign.find({ collectionAgent });
//     if (!userAssignments.length) {
//       return res.status(200).json({
//         status: true,
//         message: "No users assigned to this collection agent.",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         results: 0,
//         data: [],
//       });
//     }
//     const collectionAgentUserIds = userAssignments.map((ua) => ua.user);
//     const users = await User.find({ _id: { $in: collectionAgentUserIds } }).select("mobile");
//     const collectionAgentMobiles = users.map(user => user.mobile);
//     if (collectionAgentMobiles.length === 0) {
//       return res.status(200).json({
//         status: true,
//         message: "No users found for this collection agent.",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         results: 0,
//         data: [],
//       });
//     }
//     if (filter.mobile) {
//       filter.mobile.$in = filter.mobile.$in.filter(mobile => collectionAgentMobiles.includes(mobile));
//       if (filter.mobile.$in.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No users found matching the provided filters.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: [],
//         });
//       }
//     } else {
//       filter.mobile = { $in: collectionAgentMobiles };
//     }
//   }

//   // Search Filter Logic for Share, User, SalePerson, and CollectionAgent
//   let userMatch = {};
//   let planDockMatch = {};
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { mobile: { $regex: search, $options: "i" } },
//     ];

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
//       ],
//     };

//     if (!salePerson) {
//       const matchingSalePersons = await SalePerson.find({
//         $or: [
//           { name: { $regex: search, $options: "i" } },
//           { email: { $regex: search, $options: "i" } },
//           { mobile: { $regex: search, $options: "i" } },
//           { userId: { $regex: search, $options: "i" } },
//         ],
//       }).select("_id");

//       if (matchingSalePersons.length > 0) {
//         filter.$or.push({
//           salePerson: { $in: matchingSalePersons.map((sp) => sp._id) },
//         });
//       }
//     }

//     const matchingCollectionAgents = await CollectionAgent.find({
//       name: { $regex: search, $options: "i" },
//     }).select("_id");
//     if (matchingCollectionAgents.length > 0) {
//       const assignments = await UserAssign.find({
//         collectionAgent: { $in: matchingCollectionAgents.map(ca => ca._id) },
//       });
//       const collectionAgentUserIds = assignments.map((a) => a.user).filter(Boolean);
//       const users = await User.find({ _id: { $in: collectionAgentUserIds } }).select("mobile");
//       const collectionAgentMobiles = users.map(user => user.mobile);
//       if (collectionAgentMobiles.length > 0) {
//         if (filter.mobile) {
//           filter.mobile.$in = filter.mobile.$in.filter(mobile => collectionAgentMobiles.includes(mobile));
//           if (filter.mobile.$in.length === 0) {
//             return res.status(200).json({
//               status: true,
//               message: "No users found matching the search criteria.",
//               totalResult: 0,
//               totalPage: 0,
//               currentPage: parseInt(currentPage),
//               results: 0,
//               data: [],
//             });
//           }
//         } else {
//           filter.mobile = { $in: collectionAgentMobiles };
//         }
//       }
//     }
//   }

//   // Calculate paid EMIs and total paid amount for plans
//   const emiDetails = await EmiList.aggregate([
//     {
//       $match: {
//         "emiList.status": "Paid",
//       },
//     },
//     {
//       $unwind: "$emiList",
//     },
//     {
//       $match: { "emiList.status": "Paid" },
//     },
//     {
//       $group: {
//         _id: "$userPlan",
//         paidEmiCount: { $sum: 1 },
//         totalPaidAmount: { $sum: "$emiList.monthlyAdvance" },
//       },
//     },
//   ]);

//   const emiDetailsMap = emiDetails.reduce((map, item) => {
//     map[item._id.toString()] = {
//       paidEmiCount: item.paidEmiCount,
//       totalPaidAmount: item.totalPaidAmount,
//     };
//     return map;
//   }, {});

//   // Calculate total active plans per user
//   const activePlansCount = await UserPlan.aggregate([
//     {
//       $match: {
//         status: "Active",
//       },
//     },
//     {
//       $group: {
//         _id: "$user",
//         totalActivePlans: { $sum: 1 },
//       },
//     },
//   ]);

//   const activePlansMap = activePlansCount.reduce((map, item) => {
//     map[item._id.toString()] = item.totalActivePlans;
//     return map;
//   }, {});

//   // Pagination
//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     Share,
//     null,
//     filter
//   );

//   // Fetch shares with filters
//   const shares = await Share.find(filter)
//     .populate({
//       path: "salePerson",
//       select: "name userId",
//     })
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   // Process shares and include plan details if available
//   const results = await Promise.all(
//     shares.map(async (share) => {
//       // Find user by mobile
//       const user = await User.findOne({ mobile: share.mobile })
//         .select("name email mobile city state country redemptionDate")
//         .lean();

//       // Skip if no user found and search filter is applied
//       if (search && user) {
//         const searchMatch = user.name.match(new RegExp(search, "i")) ||
//                            user.email.match(new RegExp(search, "i")) ||
//                            user.mobile.match(new RegExp(search, "i"));
//         if (!searchMatch) return null;
//       }

//       // Fetch store location
//       let storeLocation = "";
//       if (share.salePerson) {
//         const storeAssign = await StoreAssign.findOne({
//           salePerson: share.salePerson._id,
//         })
//           .populate({
//             path: "store",
//             select: "location",
//             populate: {
//               path: "location",
//               select: "name",
//             },
//           })
//           .lean();

//         if (storeAssign && storeAssign.store && storeAssign.store.location) {
//           storeLocation = storeAssign.store.location.name || "";
//         }
//       }

//       // Initialize result object
//       const result = {
//         _id: share._id,
//         user: user ? {
//           _id: user._id,
//           name: user.name || "",
//           email: user.email || "",
//           mobile: user.mobile,
//           city: user.city || "",
//           state: user.state || "",
//           country: user.country || "",
//           redemptionDate: user.redemptionDate || null,
//         } : null,
//         salePersonName: share.salePerson ? share.salePerson.name : "",
//         salePersonId: share.salePerson ? share.salePerson.userId : "",
//         storeLocation,
//         createdAt: share.createdAt,
//         totalActivePlans: 0,
//         plans: [],
//       };

//       // Fetch active plans if user exists
//       if (user) {
//         const userPlans = await UserPlan.find({
//           user: user._id,
//           status: "Active",
//           ...(planDock ? { planDock: new mongoose.Types.ObjectId(planDock) } : {}),
//         })
//           .populate({
//             path: "user",
//             match: planDockMatch,
//           })
//           .populate({
//             path: "plan",
//             match: planDockMatch,
//           })
//           .populate({
//             path: "planDock",
//             match: planDockMatch,
//           })
//           .lean();

//         const enrichedPlans = await Promise.all(
//           userPlans
//             .filter((plan) => plan.planDock)
//             .map(async (plan) => {
//               const emiInfo = emiDetailsMap[plan._id.toString()] || {
//                 paidEmiCount: 0,
//                 totalPaidAmount: 0,
//               };

//               const planSalePersonDoc = await SalePerson.findOne({
//                 userId: plan.salePersonId,
//               }).select("name _id userId").lean();

//               let planStoreLocation = "";
//               if (planSalePersonDoc) {
//                 const planStoreAssign = await StoreAssign.findOne({
//                   salePerson: planSalePersonDoc._id,
//                 })
//                   .populate({
//                     path: "store",
//                     select: "location",
//                     populate: {
//                       path: "location",
//                       select: "name",
//                     },
//                   })
//                   .lean();

//                 if (planStoreAssign && planStoreAssign.store && planStoreAssign.store.location) {
//                   planStoreLocation = planStoreAssign.store.location.name || "";
//                 }
//               }

//               return {
//                 ...plan,
//                 salePersonName: planSalePersonDoc ? planSalePersonDoc.name : "",
//                 salePersonId: planSalePersonDoc ? planSalePersonDoc.userId : "",
//                 storeLocation: planStoreLocation,
//                 paidEmiCount: emiInfo.paidEmiCount,
//                 totalPaidAmount: emiInfo.totalPaidAmount,
//               };
//             })
//         );

//         result.totalActivePlans = activePlansMap[user._id.toString()] || 0;
//         result.plans = enrichedPlans.length > 0 ? enrichedPlans : [];
//       }

//       return result;
//     })
//   );

//   // Filter out null results (from search mismatch)
//   const filteredResults = results.filter(result => result !== null);

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: parseInt(currentPage),
//     results: filteredResults.length,
//     data: filteredResults,
//   });
// });



const mongoose = require("mongoose");
const Share = require("../../../models/share");
const User = require("../../../models/user");
const SalePerson = require("../../../models/salePerson");
const StoreAssign = require("../../../models/storeAssign");
const UserAssign = require("../../../models/userAssign");
const UserPlan = require("../../../models/userPlan");
const PlanDock = require("../../../models/planDock");
const EmiList = require("../../../models/emiList");
const CollectionAgent = require("../../../models/collectionAgent");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getAllDownloadListForAdmin = catchAsync(async (req, res, next) => {
  const {
    search,
    dateFilter,
    startDate,
    endDate,
    salePerson,
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
    // Find users with matching userId to get their mobile numbers
    const user = await User.findById(userId).select("mobile");
    if (!user) {
      return res.status(200).json({
        status: true,
        message: "No user found for the provided userId.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: [],
      });
    }
    filter.mobile = user.mobile;
  }

  if (planDock) {
    if (!mongoose.Types.ObjectId.isValid(planDock)) {
      return next(new AppError("Invalid planDock ID format.", 400));
    }
  }

  // SalePerson Filter
  if (salePerson) {
    const salePersonExists = await SalePerson.findOne({ userId: salePerson });
    if (!salePersonExists) {
      return next(new AppError("Invalid salePerson.", 400));
    }
    filter.salePerson = salePersonExists._id;
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
    filter.createdAt = { $gte: start, $lte: end };
  } else if (startDate || endDate) {
    if (startDate) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$gte = new Date(startDate);
      filter.createdAt.$gte.setUTCHours(0, 0, 0, 0);
    }
    if (endDate) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$lte = new Date(endDate);
      filter.createdAt.$lte.setUTCHours(23, 59, 59, 999);
    }
  }

  // Handle storeIds and salePersonIds filters
  let userMobiles = [];
  if ((storeIds && storeIds.length > 0) || (salePersonIds && salePersonIds.length > 0)) {
    let storeUserIds = [];
    let salePersonUserIds = [];

    // Handle storeIds filter
    if (storeIds && storeIds.length > 0) {
      const storeIdsArray = Array.isArray(storeIds) ? storeIds : storeIds.split(",").map(id => id.trim());

      if (!storeIdsArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
        return next(new AppError("Invalid store ID format.", 400));
      }

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

      const storeUserPlans = await UserPlan.find({
        salePersonId: { $in: storeSalePersonIds },
        status: "Active",
      }).select("user");

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

      const salePersonUserPlans = await UserPlan.find({
        salePersonId: { $in: validSalePersonIds },
        status: "Active",
      }).select("user");

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
    let userIds;
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

    // Convert user IDs to mobile numbers
    const users = await User.find({ _id: { $in: userIds } }).select("mobile");
    userMobiles = users.map(user => user.mobile);
    if (userMobiles.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No users found for the provided store or sale person filters.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: [],
      });
    }
    filter.mobile = { $in: userMobiles };
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
        data: [],
      });
    }
    const collectionAgentUserIds = userAssignments.map((ua) => ua.user);
    const users = await User.find({ _id: { $in: collectionAgentUserIds } }).select("mobile");
    const collectionAgentMobiles = users.map(user => user.mobile);
    if (collectionAgentMobiles.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No users found for this collection agent.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: [],
      });
    }
    if (filter.mobile) {
      filter.mobile.$in = filter.mobile.$in.filter(mobile => collectionAgentMobiles.includes(mobile));
      if (filter.mobile.$in.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No users found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: [],
        });
      }
    } else {
      filter.mobile = { $in: collectionAgentMobiles };
    }
  }

  // Search Filter Logic for Share, User, SalePerson, and CollectionAgent
  let userMatch = {};
  let planDockMatch = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ];

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
      ],
    };

    if (!salePerson) {
      const matchingSalePersons = await SalePerson.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { mobile: { $regex: search, $options: "i" } },
          { userId: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      if (matchingSalePersons.length > 0) {
        filter.$or.push({
          salePerson: { $in: matchingSalePersons.map((sp) => sp._id) },
        });
      }
    }

    const matchingCollectionAgents = await CollectionAgent.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");
    if (matchingCollectionAgents.length > 0) {
      const assignments = await UserAssign.find({
        collectionAgent: { $in: matchingCollectionAgents.map(ca => ca._id) },
      });
      const collectionAgentUserIds = assignments.map((a) => a.user).filter(Boolean);
      const users = await User.find({ _id: { $in: collectionAgentUserIds } }).select("mobile");
      const collectionAgentMobiles = users.map(user => user.mobile);
      if (collectionAgentMobiles.length > 0) {
        if (filter.mobile) {
          filter.mobile.$in = filter.mobile.$in.filter(mobile => collectionAgentMobiles.includes(mobile));
          if (filter.mobile.$in.length === 0) {
            return res.status(200).json({
              status: true,
              message: "No users found matching the search criteria.",
              totalResult: 0,
              totalPage: 0,
              currentPage: parseInt(currentPage),
              results: 0,
              data: [],
            });
          }
        } else {
          filter.mobile = { $in: collectionAgentMobiles };
        }
      }
    }
  }

  // Calculate paid EMIs and total paid amount for plans
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

  const activePlansMap = activePlansCount.reduce((map, item) => {
    map[item._id.toString()] = item.totalActivePlans;
    return map;
  }, {});

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    Share,
    null,
    filter
  );

  // Fetch shares with filters
  const shares = await Share.find(filter)
    .populate({
      path: "salePerson",
      select: "name userId",
    })
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  // Process shares and include plan details if available
  const results = await Promise.all(
    shares.map(async (share) => {
      // Find user by mobile
      const user = await User.findOne({ mobile: share.mobile })
        .select("name email mobile city state country redemptionDate")
        .lean();

      // Skip if no user found and search filter is applied
      if (search && user) {
        const searchMatch = user.name.match(new RegExp(search, "i")) ||
                           user.email.match(new RegExp(search, "i")) ||
                           user.mobile.match(new RegExp(search, "i"));
        if (!searchMatch) return null;
      }

      // Fetch store location
      let storeLocation = "";
      if (share.salePerson) {
        const storeAssign = await StoreAssign.findOne({
          salePerson: share.salePerson._id,
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

      // Initialize result object
      const result = {
        _id: share._id,
        user: user ? {
          _id: user._id,
          name: user.name || "",
          email: user.email || "",
          mobile: user.mobile,
          city: user.city || "",
          state: user.state || "",
          country: user.country || "",
          redemptionDate: user.redemptionDate || null,
        } : null,
        salePersonName: share.salePerson ? share.salePerson.name : "",
        salePersonId: share.salePerson ? share.salePerson.userId : "",
        storeLocation,
        createdAt: share.createdAt,
        totalActivePlans: 0,
        plans: [],
        isDownload: !!user, // Set isDownload to true if user exists, false otherwise
      };

      // Fetch active plans if user exists
      if (user) {
        const userPlans = await UserPlan.find({
          user: user._id,
          status: "Active",
          ...(planDock ? { planDock: new mongoose.Types.ObjectId(planDock) } : {}),
        })
          .populate({
            path: "user",
            match: planDockMatch,
          })
          .populate({
            path: "plan",
            match: planDockMatch,
          })
          .populate({
            path: "planDock",
            match: planDockMatch,
          })
          .lean();

        const enrichedPlans = await Promise.all(
          userPlans
            .filter((plan) => plan.planDock)
            .map(async (plan) => {
              const emiInfo = emiDetailsMap[plan._id.toString()] || {
                paidEmiCount: 0,
                totalPaidAmount: 0,
              };

              const planSalePersonDoc = await SalePerson.findOne({
                userId: plan.salePersonId,
              }).select("name _id userId").lean();

              let planStoreLocation = "";
              if (planSalePersonDoc) {
                const planStoreAssign = await StoreAssign.findOne({
                  salePerson: planSalePersonDoc._id,
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

                if (planStoreAssign && planStoreAssign.store && planStoreAssign.store.location) {
                  planStoreLocation = planStoreAssign.store.location.name || "";
                }
              }

              return {
                ...plan,
                salePersonName: planSalePersonDoc ? planSalePersonDoc.name : "",
                salePersonId: planSalePersonDoc ? planSalePersonDoc.userId : "",
                storeLocation: planStoreLocation,
                paidEmiCount: emiInfo.paidEmiCount,
                totalPaidAmount: emiInfo.totalPaidAmount,
              };
            })
        );

        result.totalActivePlans = activePlansMap[user._id.toString()] || 0;
        result.plans = enrichedPlans.length > 0 ? enrichedPlans : [];
      }

      return result;
    })
  );

  // Filter out null results (from search mismatch)
  const filteredResults = results.filter(result => result !== null);

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: parseInt(currentPage),
    results: filteredResults.length,
    data: filteredResults,
  });
});

