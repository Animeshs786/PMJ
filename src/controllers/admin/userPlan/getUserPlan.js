// const mongoose = require("mongoose");
// const UserPlan = require("../../../models/userPlan");
// const StoreAssign = require("../../../models/storeAssign");
// const UserAssign = require("../../../models/userAssign");
// const SalePerson = require("../../../models/salePerson");
// const EmiList = require("../../../models/emiList");
// const CollectionAgent = require("../../../models/collectionAgent");
// const User = require("../../../models/user");
// const Plan = require("../../../models/plan");
// const PlanDock = require("../../../models/planDock");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");

// exports.getUserPlan = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     dateFilter,
//     startDate,
//     endDate,
//     page: currentPage = 1,
//     limit: currentLimit = 10,
//     status,
//     salePersonId,
//     collectionAgent,
//     user,
//     storeIds,
//     salePersonIds,
//     collectionAgentIds,
//   } = req.body;

//   const matchFilter = {
//     status: { $ne: "Initiated" },
//   };

//   // Apply status filter if provided
//   if (status) matchFilter.status = status;

//   // Sale Person and User Filters
//   if (salePersonId) matchFilter.salePersonId = salePersonId;
//   if (user) {
//     if (!mongoose.Types.ObjectId.isValid(user)) {
//       return next(new AppError("Invalid user ID format", 400));
//     }
//     matchFilter.user = new mongoose.Types.ObjectId(user);
//   }

//   // Date Filter Logic
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
//   } else if (startDate || endDate) {
//     // Fallback to explicit startDate/endDate
//     if (startDate) {
//       start = new Date(startDate);
//       start.setUTCHours(0, 0, 0, 0);
//     }
//     if (endDate) {
//       end = new Date(endDate);
//       end.setUTCHours(23, 59, 59, 999);
//     }
//   } else {
//     // No date filter
//     start = null;
//     end = null;
//   }

//   // Apply date filters to planStartDate and planEndDate
//   if (start) {
//     matchFilter.planStartDate = { $gte: start };
//   }
//   if (end) {
//     matchFilter.planEndDate = { $lte: end };
//   }

//   // Handle storeIds, salePersonIds, and collectionAgentIds filters
//   let userIds = [];
//   if (
//     storeIds?.length > 0 ||
//     salePersonIds?.length > 0 ||
//     collectionAgentIds?.length > 0
//   ) {
//     let storeUserIds = [];
//     let salePersonUserIds = [];
//     let collectionAgentUserIds = [];

//     // Handle storeIds filter
//     if (storeIds?.length > 0) {
//       const storeIdsArray = Array.isArray(storeIds)
//         ? storeIds
//         : storeIds.split(",").map((id) => id.trim());

//       // Validate storeIds format
//       if (!storeIdsArray.every((id) => mongoose.Types.ObjectId.isValid(id))) {
//         return next(new AppError("Invalid store ID format.", 400));
//       }

//       // Find store assignments for the given store IDs
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
//           data: { userPlan: [] },
//         });
//       }

//       // Collect all salePerson userIds
//       const storeSalePersonIds = [
//         ...new Set(
//           storeAssigns
//             .flatMap((storeAssign) => storeAssign.salePerson)
//             .filter((sp) => sp)
//             .map((sp) => sp.userId)
//         ),
//       ];

//       if (storeSalePersonIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No sale persons found for these stores.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: { userPlan: [] },
//         });
//       }

//       // Find user plans for the collected salePerson userIds
//       const storeUserPlans = await UserPlan.find({
//         salePersonId: { $in: storeSalePersonIds },
//         status: { $ne: "Initiated" },
//       }).select("user");

//       // Extract unique user IDs
//       storeUserIds = [
//         ...new Set(storeUserPlans.map((plan) => plan.user.toString())),
//       ];

//       if (storeUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No user plans found for these stores.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: { userPlan: [] },
//         });
//       }
//     }

//     // Handle salePersonIds filter
//     if (salePersonIds?.length > 0) {
//       const salePersonIdsArray = Array.isArray(salePersonIds)
//         ? salePersonIds
//         : salePersonIds.split(",").map((id) => id.trim());

//       // Validate salePersonIds by checking SalePerson collection
//       const validSalePersons = await SalePerson.find({
//         userId: { $in: salePersonIdsArray },
//       }).select("userId");

//       const validSalePersonIds = validSalePersons.map((sp) => sp.userId);

//       if (validSalePersonIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No valid sale persons found for the provided IDs.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: { userPlan: [] },
//         });
//       }

//       // Find user plans for the collected salePerson userIds
//       const salePersonUserPlans = await UserPlan.find({
//         salePersonId: { $in: validSalePersonIds },
//         status: { $ne: "Initiated" },
//       });

//       // Extract unique user IDs
//       salePersonUserIds = [
//         ...new Set(salePersonUserPlans.map((plan) => plan.user.toString())),
//       ];

//       if (salePersonUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No user plans found for these sale persons.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: { userPlan: [] },
//         });
//       }
//     }

//     // Handle collectionAgentIds filter
//     if (collectionAgentIds?.length > 0) {
//       const collectionAgentIdsArray = Array.isArray(collectionAgentIds)
//         ? collectionAgentIds
//         : collectionAgentIds.split(",").map((id) => id.trim());

//       // Validate collectionAgentIds format
//       if (
//         !collectionAgentIdsArray.every((id) =>
//           mongoose.Types.ObjectId.isValid(id)
//         )
//       ) {
//         return next(new AppError("Invalid collection agent ID format", 400));
//       }

//       // Find user assignments for the given collectionAgent IDs
//       const userAssignments = await UserAssign.find({
//         collectionAgent: { $in: collectionAgentIdsArray },
//       });

//       if (!userAssignments.length) {
//         return res.status(200).json({
//           status: true,
//           message: "No users assigned to these collection agents",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: { userPlan: [] },
//         });
//       }

//       // Extract unique user IDs
//       collectionAgentUserIds = [
//         ...new Set(userAssignments.map((ua) => ua.user.toString())),
//       ];

//       if (collectionAgentUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No users assigned to these collection agents",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: { userPlan: [] },
//         });
//       }
//     }

//     // Combine filters: intersect user IDs if multiple filters are provided
//     if (
//       storeIds?.length > 0 ||
//       salePersonIds?.length > 0 ||
//       collectionAgentIds?.length > 0
//     ) {
//       let combinedUserIds = [];
//       if (
//         storeIds?.length > 0 &&
//         salePersonIds?.length > 0 &&
//         collectionAgentIds?.length > 0
//       ) {
//         combinedUserIds = storeUserIds
//           .filter((id) => salePersonUserIds.includes(id))
//           .filter((id) => collectionAgentUserIds.includes(id));
//       } else if (storeIds?.length > 0 && salePersonIds?.length > 0) {
//         combinedUserIds = storeUserIds.filter((id) =>
//           salePersonUserIds.includes(id)
//         );
//       } else if (storeIds?.length > 0 && collectionAgentIds?.length > 0) {
//         combinedUserIds = storeUserIds.filter((id) =>
//           collectionAgentUserIds.includes(id)
//         );
//       } else if (salePersonIds?.length > 0 && collectionAgentIds?.length > 0) {
//         combinedUserIds = salePersonUserIds.filter((id) =>
//           collectionAgentUserIds.includes(id)
//         );
//       } else if (storeIds?.length > 0) {
//         combinedUserIds = storeUserIds;
//       } else if (salePersonIds?.length > 0) {
//         combinedUserIds = salePersonUserIds;
//       } else {
//         combinedUserIds = collectionAgentUserIds;
//       }

//       if (combinedUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No user plans found matching the provided filters.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: { userPlan: [] },
//         });
//       }

//       // Add user IDs to filter
//       matchFilter.user = {
//         $in: combinedUserIds.map((id) => new mongoose.Types.ObjectId(id)),
//       };
//     }
//   }

//   // Collection Agent Filter (single collectionAgent for backward compatibility)
//   if (collectionAgent) {
//     if (!mongoose.Types.ObjectId.isValid(collectionAgent)) {
//       return next(new AppError("Invalid collection agent ID format", 400));
//     }
//     const userAssignments = await UserAssign.find({ collectionAgent });
//     if (!userAssignments.length) {
//       return res.status(200).json({
//         status: true,
//         message: "No users assigned to this collection agent",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         results: 0,
//         data: { userPlan: [] },
//       });
//     }
//     const collectionAgentUserIds = userAssignments.map((ua) => ua.user);
//     if (matchFilter.user) {
//       matchFilter.user.$in = matchFilter.user.$in.filter((id) =>
//         collectionAgentUserIds.some((cid) => cid.equals(id))
//       );
//       if (matchFilter.user.$in.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No user plans found matching the provided filters.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage),
//           results: 0,
//           data: { userPlan: [] },
//         });
//       }
//     } else {
//       matchFilter.user = { $in: collectionAgentUserIds };
//     }
//   }

//   // Calculate paid EMIs and total paid amount
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

//   // Create a map for quick lookup of EMI details
//   const emiDetailsMap = emiDetails.reduce((map, item) => {
//     map[item._id.toString()] = {
//       paidEmiCount: item.paidEmiCount,
//       totalPaidAmount: item.totalPaidAmount,
//     };
//     return map;
//   }, {});

//   // Pagination Logic
//   const totalResult = await UserPlan.countDocuments(matchFilter);
//   const limit = Math.max(1, parseInt(currentLimit));
//   const totalPage = Math.ceil(totalResult / limit);
//   const currentPageNum =
//     totalPage > 0 ? Math.min(Math.max(1, parseInt(currentPage)), totalPage) : 1;
//   const skip = Math.max(0, (currentPageNum - 1) * limit);

//   // Aggregation Query with planDock population
//   const aggregationPipeline = [
//     { $match: matchFilter },
//     {
//       $lookup: {
//         from: "users",
//         localField: "user",
//         foreignField: "_id",
//         as: "user",
//       },
//     },
//     { $unwind: "$user" },
//     {
//       $lookup: {
//         from: "plans",
//         localField: "plan",
//         foreignField: "_id",
//         as: "plan",
//       },
//     },
//     { $unwind: "$plan" },
//     {
//       $lookup: {
//         from: "plandocks",
//         localField: "planDock",
//         foreignField: "_id",
//         as: "planDock",
//       },
//     },
//     { $unwind: { path: "$planDock", preserveNullAndEmptyArrays: true } },
//     {
//       $match: search
//         ? {
//             $or: [
//               { "user.name": { $regex: search, $options: "i" } },
//               { "user.mobile": { $regex: search, $options: "i" } },
//               { "plan.name": { $regex: search, $options: "i" } },
//               { status: { $regex: search, $options: "i" } },
//               { commitedAmount: { $regex: search, $options: "i" } },
//             ],
//           }
//         : {},
//     },
//     { $sort: { createdAt: -1 } },
//     { $skip: skip },
//     { $limit: limit },
//   ];

//   const userPlans = await UserPlan.aggregate(aggregationPipeline);

//   // Add salePersonName, storeLocation, paidEmiCount, and totalPaidAmount
//   const enrichedPlans = await Promise.all(
//     userPlans.map(async (plan) => {
//       // Fetch SalePerson for salePersonName
//       const salePersonDoc = await SalePerson.findOne({
//         userId: plan.salePersonId,
//       })
//         .select("name _id userId")
//         .lean();

//       // Fetch StoreAssign for storeLocation
//       let storeLocation = "";
//       if (salePersonDoc) {
//         const storeAssign = await StoreAssign.findOne({
//           salePerson: salePersonDoc._id,
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

//       // Get EMI details
//       const emiInfo = emiDetailsMap[plan._id.toString()] || {
//         paidEmiCount: 0,
//         totalPaidAmount: 0,
//       };

//       return {
//         ...plan,
//         salePersonName: salePersonDoc ? salePersonDoc.name : "",
//         salePersonId: salePersonDoc ? salePersonDoc.userId : "",
//         storeLocation,
//         paidEmiCount: emiInfo.paidEmiCount,
//         totalPaidAmount: emiInfo.totalPaidAmount,
//       };
//     })
//   );

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPageNum,
//     results: enrichedPlans.length,
//     data: {
//       userPlan: enrichedPlans,
//     },
//   });
// });

const mongoose = require("mongoose");
const UserPlan = require("../../../models/userPlan");
const StoreAssign = require("../../../models/storeAssign");
const UserAssign = require("../../../models/userAssign");
const SalePerson = require("../../../models/salePerson");
const EmiList = require("../../../models/emiList");
const CollectionAgent = require("../../../models/collectionAgent");
const User = require("../../../models/user");
const Plan = require("../../../models/plan");
const PlanDock = require("../../../models/planDock");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getUserPlan = catchAsync(async (req, res, next) => {
  const {
    search,
    dateFilter,
    startDate,
    endDate,
    page: currentPage = 1,
    limit: currentLimit = 10,
    status,
    salePersonId,
    collectionAgent,
    user,
    storeIds,
    salePersonIds,
    collectionAgentIds,
  } = req.body;

  const matchFilter = {
    status: { $ne: "Initiated" },
  };

  // Apply status filter if provided
  if (status) matchFilter.status = status;

  // Sale Person and User Filters
  if (salePersonId) matchFilter.salePersonId = salePersonId;
  if (user) {
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return next(new AppError("Invalid user ID format", 400));
    }
    matchFilter.user = new mongoose.Types.ObjectId(user);
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

  // Apply date filters to planStartDate and planEndDate
  if (start) {
    matchFilter.planStartDate = { $gte: start };
  }
  if (end) {
    matchFilter.planEndDate = { $lte: end };
  }

  // Handle storeIds, salePersonIds, and collectionAgentIds filters
  let userIds = [];
  if (
    storeIds?.length > 0 ||
    salePersonIds?.length > 0 ||
    collectionAgentIds?.length > 0
  ) {
    let storeUserIds = [];
    let salePersonUserIds = [];
    let collectionAgentUserIds = [];

    // Handle storeIds filter
    if (storeIds?.length > 0) {
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
          currentPage: parseInt(currentPage),
          results: 0,
          data: { userPlan: [] },
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
          currentPage: parseInt(currentPage),
          results: 0,
          data: { userPlan: [] },
        });
      }

      // Find user plans for the collected salePerson userIds
      const storeUserPlans = await UserPlan.find({
        salePersonId: { $in: storeSalePersonIds },
        status: { $ne: "Initiated" },
      }).select("user");

      // Extract unique user IDs
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
          data: { userPlan: [] },
        });
      }
    }

    // Handle salePersonIds filter
    if (salePersonIds?.length > 0) {
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
          currentPage: parseInt(currentPage),
          results: 0,
          data: { userPlan: [] },
        });
      }

      // Find user plans for the collected salePerson userIds
      const salePersonUserPlans = await UserPlan.find({
        salePersonId: { $in: validSalePersonIds },
        status: { $ne: "Initiated" },
      });

      // Extract unique user IDs
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
          data: { userPlan: [] },
        });
      }
    }

    // Handle collectionAgentIds filter
    if (collectionAgentIds?.length > 0) {
      const collectionAgentIdsArray = Array.isArray(collectionAgentIds)
        ? collectionAgentIds
        : collectionAgentIds.split(",").map((id) => id.trim());

      // Validate collectionAgentIds format
      if (
        !collectionAgentIdsArray.every((id) =>
          mongoose.Types.ObjectId.isValid(id)
        )
      ) {
        return next(new AppError("Invalid collection agent ID format", 400));
      }

      // Find user assignments for the given collectionAgent IDs
      const userAssignments = await UserAssign.find({
        collectionAgent: { $in: collectionAgentIdsArray },
      });

      if (!userAssignments.length) {
        return res.status(200).json({
          status: true,
          message: "No users assigned to these collection agents",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: { userPlan: [] },
        });
      }

      // Extract unique user IDs
      collectionAgentUserIds = [
        ...new Set(userAssignments.map((ua) => ua.user.toString())),
      ];

      if (collectionAgentUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No users assigned to these collection agents",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: { userPlan: [] },
        });
      }
    }

    // Combine filters: intersect user IDs if multiple filters are provided
    if (
      storeIds?.length > 0 ||
      salePersonIds?.length > 0 ||
      collectionAgentIds?.length > 0
    ) {
      let combinedUserIds = [];
      if (
        storeIds?.length > 0 &&
        salePersonIds?.length > 0 &&
        collectionAgentIds?.length > 0
      ) {
        combinedUserIds = storeUserIds
          .filter((id) => salePersonUserIds.includes(id))
          .filter((id) => collectionAgentUserIds.includes(id));
      } else if (storeIds?.length > 0 && salePersonIds?.length > 0) {
        combinedUserIds = storeUserIds.filter((id) =>
          salePersonUserIds.includes(id)
        );
      } else if (storeIds?.length > 0 && collectionAgentIds?.length > 0) {
        combinedUserIds = storeUserIds.filter((id) =>
          collectionAgentUserIds.includes(id)
        );
      } else if (salePersonIds?.length > 0 && collectionAgentIds?.length > 0) {
        combinedUserIds = salePersonUserIds.filter((id) =>
          collectionAgentUserIds.includes(id)
        );
      } else if (storeIds?.length > 0) {
        combinedUserIds = storeUserIds;
      } else if (salePersonIds?.length > 0) {
        combinedUserIds = salePersonUserIds;
      } else {
        combinedUserIds = collectionAgentUserIds;
      }

      if (combinedUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No user plans found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: { userPlan: [] },
        });
      }

      // Add user IDs to filter
      matchFilter.user = {
        $in: combinedUserIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
  }

  // Collection Agent Filter (single collectionAgent for backward compatibility)
  if (collectionAgent) {
    if (!mongoose.Types.ObjectId.isValid(collectionAgent)) {
      return next(new AppError("Invalid collection agent ID format", 400));
    }
    const userAssignments = await UserAssign.find({ collectionAgent });
    if (!userAssignments.length) {
      return res.status(200).json({
        status: true,
        message: "No users assigned to this collection agent",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        results: 0,
        data: { userPlan: [] },
      });
    }
    const collectionAgentUserIds = userAssignments.map((ua) => ua.user);
    if (matchFilter.user) {
      matchFilter.user.$in = matchFilter.user.$in.filter((id) =>
        collectionAgentUserIds.some((cid) => cid.equals(id))
      );
      if (matchFilter.user.$in.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No user plans found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          results: 0,
          data: { userPlan: [] },
        });
      }
    } else {
      matchFilter.user = { $in: collectionAgentUserIds };
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

  // Fetch all EmiList documents for userPlans to include as statements
  const emiLists = await EmiList.find({
    userPlan: {
      $in: (await UserPlan.find(matchFilter).select("_id")).map((p) => p._id),
    },
  }).lean();

  // Create a map for quick lookup of EmiList statements
  const emiListMap = emiLists.reduce((map, item) => {
    map[item.userPlan.toString()] = item;
    return map;
  }, {});

  // Pagination Logic
  const totalResult = await UserPlan.countDocuments(matchFilter);
  const limit = Math.max(1, parseInt(currentLimit));
  const totalPage = Math.ceil(totalResult / limit);
  const currentPageNum =
    totalPage > 0 ? Math.min(Math.max(1, parseInt(currentPage)), totalPage) : 1;
  const skip = Math.max(0, (currentPageNum - 1) * limit);

  // Aggregation Query with planDock population
  const aggregationPipeline = [
    { $match: matchFilter },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $lookup: {
        from: "plans",
        localField: "plan",
        foreignField: "_id",
        as: "plan",
      },
    },
    { $unwind: "$plan" },
    {
      $lookup: {
        from: "plandocks",
        localField: "planDock",
        foreignField: "_id",
        as: "planDock",
      },
    },
    { $unwind: { path: "$planDock", preserveNullAndEmptyArrays: true } },
    {
      $match: search
        ? {
            $or: [
              { "user.name": { $regex: search, $options: "i" } },
              { "user.mobile": { $regex: search, $options: "i" } },
              { "plan.name": { $regex: search, $options: "i" } },
              { status: { $regex: search, $options: "i" } },
              { commitedAmount: { $regex: search, $options: "i" } },
            ],
          }
        : {},
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const userPlans = await UserPlan.aggregate(aggregationPipeline);

  // Add salePersonName, storeLocation, paidEmiCount, totalPaidAmount, and statement
  const enrichedPlans = await Promise.all(
    userPlans.map(async (plan) => {
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

      // Get EMI details
      const emiInfo = emiDetailsMap[plan._id.toString()] || {
        paidEmiCount: 0,
        totalPaidAmount: 0,
      };

      // Get statement from emiListMap
      const statement = emiListMap[plan._id.toString()] || null;

      return {
        ...plan,
        salePersonName: salePersonDoc ? salePersonDoc.name : "",
        salePersonId: salePersonDoc ? salePersonDoc.userId : "",
        storeLocation,
        paidEmiCount: emiInfo.paidEmiCount,
        totalPaidAmount: emiInfo.totalPaidAmount,
        statement, // Add statement to the response
      };
    })
  );

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPageNum,
    results: enrichedPlans.length,
    data: {
      userPlan: enrichedPlans,
    },
  });
});