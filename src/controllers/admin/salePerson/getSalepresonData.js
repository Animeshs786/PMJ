// const mongoose = require("mongoose");
// const SalePerson = require("../../../models/salePerson");
// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const StoreAssign = require("../../../models/storeAssign");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const pagination = require("../../../utils/pagination");

// exports.getAllSalePersonDetail = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//     store,
//     dateFilter,
//   } = req.query;

//   // Define currentMonth and currentYear at the start
//   const now = new Date();
//   const currentMonth = now.getMonth() + 1; // 1-12 (January is 1)
//   const currentYear = now.getFullYear();

//   const filter = {};

//   // Apply name and mobile search filter
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { mobile: { $regex: search, $options: "i" } },
//     ];
//   }

//   // Apply status filter
//   if (status) {
//     filter.status = status;
//   }

//   // Apply store filter
//   let salePersonIds = [];
//   if (store) {
//     if (!mongoose.Types.ObjectId.isValid(store)) {
//       return next(new AppError("Invalid store ID format", 400));
//     }
//     const storeAssign = await StoreAssign.findOne({ store }).populate("salePerson");
//     if (!storeAssign || !storeAssign.salePerson.length) {
//       return res.status(200).json({
//         status: true,
//         message: "No sale persons found for this store",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage) || 1,
//         results: 0,
//         data: { salePerson: [] },
//       });
//     }
//     salePersonIds = storeAssign.salePerson.map((sp) => sp._id);
//     filter._id = { $in: salePersonIds };
//   }

//   // Apply date filter (QTD, MTD, YTD, CUSTOM)
//   if (dateFilter) {
//     const start = new Date();
//     const end = new Date();

//     switch (dateFilter.toUpperCase()) {
//       case "QTD":
//         if ([1, 2, 3].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 0, 1);
//           end.setUTCFullYear(currentYear, 2, 31);
//         } else if ([4, 5, 6].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 3, 1);
//           end.setUTCFullYear(currentYear, 5, 30);
//         } else if ([7, 8, 9].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 6, 1);
//           end.setUTCFullYear(currentYear, 8, 30);
//         } else {
//           start.setUTCFullYear(currentYear, 9, 1);
//           end.setUTCFullYear(currentYear, 11, 31);
//         }
//         start.setUTCHours(0, 0, 0, 0);
//         end.setUTCHours(23, 59, 59, 999);
//         break;

//       case "MTD":
//         start.setUTCFullYear(currentYear, currentMonth - 1, 1);
//         start.setUTCHours(0, 0, 0, 0);
//         end.setUTCHours(23, 59, 59, 999);
//         break;

//       case "YTD":
//         if (currentMonth >= 4) {
//           start.setUTCFullYear(currentYear, 3, 1);
//         } else {
//           start.setUTCFullYear(currentYear - 1, 3, 1);
//         }
//         end.setUTCFullYear(currentYear, 2, 31);
//         start.setUTCHours(0, 0, 0, 0);
//         end.setUTCHours(23, 59, 59, 999);
//         break;

//       case "CUSTOM":
//         if (startDate) {
//           start.setTime(new Date(startDate).getTime());
//           start.setUTCHours(0, 0, 0, 0);
//         }
//         if (endDate) {
//           end.setTime(new Date(endDate).getTime());
//           end.setUTCHours(23, 59, 59, 999);
//         } else {
//           end.setUTCHours(23, 59, 59, 999);
//         }
//         break;

//       default:
//         return next(new AppError("Invalid date filter", 400));
//     }
//     filter.createdAt = { $gte: start, $lte: end };
//   }

//   // Pagination
//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     SalePerson,
//     null,
//     filter
//   );

//   // Fetch salespeople
//   const salePersons = await SalePerson.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   // Calculate stats for each salesperson
//   const salePersonStats = await Promise.all(
//     salePersons.map(async (sp) => {
//       // Total Plan Count and Installment Value
//       const userPlans = await UserPlan.find({ salePersonId: sp.userId ,status:{$ne:"Initiated"}});
//       const planCount = userPlans.length;
//       const userPlanIds = userPlans.map((up) => up._id);

//       const emiLists = await EmiList.find({ userPlan: { $in: userPlanIds } });
//       const totalInstallmentValue = emiLists.reduce((sum, emiList) => {
//         return (
//           sum +
//           emiList.emiList.reduce((emiSum, emi) => {
//             return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
//           }, 0)
//         );
//       }, 0);

//       // Foreclosed Plans
//       const foreclosedPlans = userPlans.filter((up) => up.status === "Forclosed");
//       const foreclosedPlanCount = foreclosedPlans.length;
//       const foreclosedPlanIds = foreclosedPlans.map((up) => up._id);
//       const foreclosedInstallmentValue = (await EmiList.find({ userPlan: { $in: foreclosedPlanIds } })).reduce(
//         (sum, emiList) => {
//           return (
//             sum +
//             emiList.emiList.reduce((emiSum, emi) => {
//               return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
//             }, 0)
//           );
//         },
//         0
//       );

//       // Active/Completed Plans
//       const activeCompletedPlans = userPlans.filter((up) =>
//         ["Active", "Completed"].includes(up.status)
//       );
//       const activeCompletedPlanCount = activeCompletedPlans.length;
//       const activeCompletedPlanIds = activeCompletedPlans.map((up) => up._id);
//       const activeCompletedInstallmentValue = (await EmiList.find({ userPlan: { $in: activeCompletedPlanIds } })).reduce(
//         (sum, emiList) => {
//           return (
//             sum +
//             emiList.emiList.reduce((emiSum, emi) => {
//               return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
//             }, 0)
//           );
//         },
//         0
//       );

//       // Monthly Breakdown (April to March)
//       const fiscalYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
//       const monthlyStats = Array.from({ length: 12 }, (_, i) => {
//         const monthIndex = (3 + i) % 12; // April (3) to March (2)
//         const monthName = new Date(0, monthIndex).toLocaleString("en", { month: "long" });
//         const monthStart = new Date(fiscalYearStart, monthIndex, 1);
//         const monthEnd = new Date(fiscalYearStart, monthIndex + 1, 0, 23, 59, 59, 999);

//         const monthPlans = userPlans.filter((up) => {
//           const createdAt = new Date(up.createdAt);
//           return createdAt >= monthStart && createdAt <= monthEnd;
//         });
//         const monthPlanCount = monthPlans.length;
//         const monthPlanIds = monthPlans.map((up) => up._id);

//         const monthInstallmentValue = (emiLists.filter((emiList) => monthPlanIds.includes(emiList.userPlan))).reduce(
//           (sum, emiList) => {
//             return (
//               sum +
//               emiList.emiList.reduce((emiSum, emi) => {
//                 const dueDate = new Date(emi.dueDate);
//                 if (
//                   emi.status === "Paid" &&
//                   dueDate >= monthStart &&
//                   dueDate <= monthEnd
//                 ) {
//                   return emiSum + (emi.monthlyAdvance || 0);
//                 }
//                 return emiSum;
//               }, 0)
//             );
//           },
//           0
//         );

//         return {
//           month: monthName,
//           planCount: monthPlanCount,
//           installmentValue: monthInstallmentValue,
//         };
//       });

//       return {
//         salePerson: sp,
//         stats: {
//           totalPlanCount: planCount,
//           totalInstallmentValue,
//           foreclosedPlanCount,
//           foreclosedInstallmentValue,
//           activeCompletedPlanCount,
//           activeCompletedInstallmentValue,
//           monthlyStats,
//         },
//       };
//     })
//   );

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: parseInt(currentPage) || 1,
//     results: salePersonStats.length,
//     data: {
//       salePerson: salePersonStats,
//     },
//   });
// });

// const mongoose = require("mongoose");
// const SalePerson = require("../../../models/salePerson");
// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const StoreAssign = require("../../../models/storeAssign");
// const Store = require("../../../models/store");
// const Location = require("../../../models/location");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const pagination = require("../../../utils/pagination");

// exports.getAllSalePersonDetail = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//     storeIds,
//     dateFilter,
//   } = req.body;

//   // Define currentMonth and currentYear at the start
//   const now = new Date();
//   const currentMonth = now.getMonth() + 1; // 1-12 (January is 1)
//   const currentYear = now.getFullYear();

//   let filter = {};

//   // Apply name, mobile, or userId search filter
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { mobile: { $regex: search, $options: "i" } },
//       { userId: { $regex: search, $options: "i" } },
//     ];
//   }

//   // Apply status filter
//   if (status) {
//     filter.status = status;
//   }

//   // Apply storeIds filter
//   let salePersonIds = [];
//   if (storeIds && storeIds.length > 0) {
//     const storeIdsArray = Array.isArray(storeIds)
//       ? storeIds
//       : storeIds.split(",").map((id) => id.trim());

//     // Validate storeIds format
//     if (!storeIdsArray.every((id) => mongoose.Types.ObjectId.isValid(id))) {
//       return next(new AppError("Invalid store ID format", 400));
//     }

//     // Log storeIds for debugging
//     console.log("storeIdsArray:", storeIdsArray);

//     // Find store assignments for the given store IDs
//     const storeAssigns = await StoreAssign.find({
//       store: { $in: storeIdsArray },
//     }).lean();

//     if (!storeAssigns || storeAssigns.length === 0) {
//       console.log(`No store assignments found for storeIds: ${storeIdsArray}`);
//       return res.status(200).json({
//         status: true,
//         message: "No sale persons found for these stores",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage) || 1,
//         results: 0,
//         data: { salePerson: [] },
//       });
//     }

//     // Log raw store assignments
//     console.log(
//       "Raw store assignments:",
//       storeAssigns.map((sa) => ({
//         store: sa.store,
//         salePerson: sa.salePerson,
//       }))
//     );

//     // Collect salePerson IDs, handling array of ObjectIds
//     const salePersonObjectIds = [
//       ...new Set(
//         storeAssigns
//           .filter((sa) => sa.salePerson) // Ensure salePerson exists
//           .flatMap((sa) =>
//             Array.isArray(sa.salePerson)
//               ? sa.salePerson.map((id) => id.toString())
//               : [sa.salePerson.toString()]
//           )
//       ),
//     ];

//     // Log collected salePerson IDs
//     console.log("salePersonObjectIds:", salePersonObjectIds);

//     // Validate salePerson IDs
//     const validSalePersons = await SalePerson.find({
//       _id: { $in: salePersonObjectIds },
//     })
//       .select("_id")
//       .lean();
//     salePersonIds = validSalePersons.map((sp) => sp._id.toString());

//     // Log valid salePerson IDs
//     console.log("Valid salePerson IDs:", salePersonIds);

//     if (salePersonIds.length === 0) {
//       console.log("No valid salePerson references found for store assignments");
//       return res.status(200).json({
//         status: true,
//         message: "No valid sale persons found for these stores",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage) || 1,
//         results: 0,
//         data: { salePerson: [] },
//       });
//     }

//     // Add salePerson IDs to filter
//     filter._id = { $in: salePersonIds };
//   }

//   // Apply date filter (QTD, MTD, YTD, CUSTOM)
//   if (dateFilter) {
//     const start = new Date();
//     const end = new Date();

//     switch (dateFilter.toUpperCase()) {
//       case "QTD":
//         if ([1, 2, 3].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 0, 1);
//           end.setUTCFullYear(currentYear, 2, 31);
//         } else if ([4, 5, 6].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 3, 1);
//           end.setUTCFullYear(currentYear, 5, 30);
//         } else if ([7, 8, 9].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 6, 1);
//           end.setUTCFullYear(currentYear, 8, 30);
//         } else {
//           start.setUTCFullYear(currentYear, 9, 1);
//           end.setUTCFullYear(currentYear, 11, 31);
//         }
//         break;

//       case "MTD":
//         start.setUTCFullYear(currentYear, currentMonth - 1, 1);
//         end.setUTCFullYear(currentYear, currentMonth - 1, now.getDate());
//         break;

//       case "YTD":
//         if (currentMonth >= 4) {
//           start.setUTCFullYear(currentYear, 3, 1);
//         } else {
//           start.setUTCFullYear(currentYear - 1, 3, 1);
//         }
//         end.setUTCFullYear(currentYear, 2, 31);
//         break;

//       case "CUSTOM":
//         if (startDate) {
//           start.setTime(new Date(startDate).getTime());
//         } else {
//           return next(
//             new AppError("startDate is required for CUSTOM date filter", 400)
//           );
//         }
//         if (endDate) {
//           end.setTime(new Date(endDate).getTime());
//         } else {
//           end.setUTCHours(23, 59, 59, 999);
//         }
//         break;

//       default:
//         return next(new AppError("Invalid date filter", 400));
//     }
//     start.setUTCHours(0, 0, 0, 0);
//     end.setUTCHours(23, 59, 59, 999);
//     filter.createdAt = { $gte: start, $lte: end };
//   }

//   // Pagination
//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     SalePerson,
//     null,
//     filter
//   );

//   // Fetch salespeople
//   const salePersons = await SalePerson.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt")
//     .select("name mobile userId email status createdAt")
//     .lean();

//   // Calculate stats and fetch store details for each salesperson
//   const salePersonStats = await Promise.all(
//     salePersons.map(async (sp) => {
//       // Total Plan Count and Installment Value
//       const userPlans = await UserPlan.find({
//         salePersonId: sp.userId,
//         status: { $ne: "Initiated" },
//       });
//       const planCount = userPlans.length;
//       const userPlanIds = userPlans.map((up) => up._id);

//       const emiLists = await EmiList.find({ userPlan: { $in: userPlanIds } });
//       const totalInstallmentValue = emiLists.reduce((sum, emiList) => {
//         return (
//           sum +
//           emiList.emiList.reduce((emiSum, emi) => {
//             return emi.status === "Paid"
//               ? emiSum + (emi.monthlyAdvance || 0)
//               : emiSum;
//           }, 0)
//         );
//       }, 0);

//       // Foreclosed Plans
//       const foreclosedPlans = userPlans.filter(
//         (up) => up.status === "Forclosed"
//       );
//       const foreclosedPlanCount = foreclosedPlans.length;
//       const foreclosedPlanIds = foreclosedPlans.map((up) => up._id);
//       const foreclosedInstallmentValue = (
//         await EmiList.find({ userPlan: { $in: foreclosedPlanIds } })
//       ).reduce((sum, emiList) => {
//         return (
//           sum +
//           emiList.emiList.reduce((emiSum, emi) => {
//             return emi.status === "Paid"
//               ? emiSum + (emi.monthlyAdvance || 0)
//               : emiSum;
//           }, 0)
//         );
//       }, 0);

//       // Active/Completed Plans
//       const activeCompletedPlans = userPlans.filter((up) =>
//         ["Active", "Completed"].includes(up.status)
//       );
//       const activeCompletedPlanCount = activeCompletedPlans.length;
//       const activeCompletedPlanIds = activeCompletedPlans.map((up) => up._id);
//       const activeCompletedInstallmentValue = (
//         await EmiList.find({ userPlan: { $in: activeCompletedPlanIds } })
//       ).reduce((sum, emiList) => {
//         return (
//           sum +
//           emiList.emiList.reduce((emiSum, emi) => {
//             return emi.status === "Paid"
//               ? emiSum + (emi.monthlyAdvance || 0)
//               : emiSum;
//           }, 0)
//         );
//       }, 0);

//       // Monthly Breakdown (April to March)
//       const fiscalYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
//       const monthlyStats = Array.from({ length: 12 }, (_, i) => {
//         const monthIndex = (3 + i) % 12; // April (3) to March (2)
//         const monthName = new Date(0, monthIndex).toLocaleString("en", {
//           month: "long",
//         });
//         const monthStart = new Date(fiscalYearStart, monthIndex, 1);
//         const monthEnd = new Date(
//           fiscalYearStart,
//           monthIndex + 1,
//           0,
//           23,
//           59,
//           59,
//           999
//         );

//         const monthPlans = userPlans.filter((up) => {
//           const createdAt = new Date(up.createdAt);
//           return createdAt >= monthStart && createdAt <= monthEnd;
//         });
//         const monthPlanCount = monthPlans.length;
//         const monthPlanIds = monthPlans.map((up) => up._id);

//         const monthInstallmentValue = emiLists
//           .filter((emiList) => monthPlanIds.includes(emiList.userPlan))
//           .reduce((sum, emiList) => {
//             return (
//               sum +
//               emiList.emiList.reduce((emiSum, emi) => {
//                 const dueDate = new Date(emi.dueDate);
//                 if (
//                   emi.status === "Paid" &&
//                   dueDate >= monthStart &&
//                   dueDate <= monthEnd
//                 ) {
//                   return emiSum + (emi.monthlyAdvance || 0);
//                 }
//                 return emiSum;
//               }, 0)
//             );
//           }, 0);

//         return {
//           month: monthName,
//           planCount: monthPlanCount,
//           installmentValue: monthInstallmentValue,
//         };
//       });

//       // Fetch store details for the salesperson
//       const storeAssigns = await StoreAssign.find({ salePerson: sp._id })
//         .populate({
//           path: "store",
//           select: "address",
//           populate: {
//             path: "location",
//             select: "name state",
//           },
//         })
//         .lean();

//       const stores = [
//         ...new Set(
//           storeAssigns
//             .filter((sa) => sa.store && sa.store.location)
//             .map((sa) => ({
//               storeId: sa.store._id.toString(),
//               address: sa.store.address,
//               locationName: sa.store.location.name,
//               state: sa.store.location.state,
//             }))
//         ),
//       ];

//       return {
//         salePerson: {
//           _id: sp._id,
//           name: sp.name,
//           mobile: sp.mobile,
//           userId: sp.userId,
//           email: sp.email,
//           status: sp.status,
//           createdAt: sp.createdAt,
//           stores,
//         },
//         stats: {
//           totalPlanCount: planCount,
//           totalInstallmentValue,
//           foreclosedPlanCount,
//           foreclosedInstallmentValue,
//           activeCompletedPlanCount,
//           activeCompletedInstallmentValue,
//           monthlyStats,
//         },
//       };
//     })
//   );

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: parseInt(currentPage) || 1,
//     results: salePersonStats.length,
//     data: {
//       salePerson: salePersonStats,
//     },
//   });
// });



// const mongoose = require("mongoose");
// const SalePerson = require("../../../models/salePerson");
// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const StoreAssign = require("../../../models/storeAssign");
// const Store = require("../../../models/store");
// const Location = require("../../../models/location");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const pagination = require("../../../utils/pagination");

// exports.getAllSalePersonDetail = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//     storeIds,
//     dateFilter,
//   } = req.query;

//   // Define currentMonth and currentYear at the start
//   const now = new Date();
//   const currentMonth = now.getMonth() + 1; // 1-12 (January is 1)
//   const currentYear = now.getFullYear();

//   let filter = {};

//   // Apply name, mobile, or userId search filter
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { mobile: { $regex: search, $options: "i" } },
//       { userId: { $regex: search, $options: "i" } },
//     ];
//   }

//   // Apply status filter
//   if (status) {
//     filter.status = status;
//   }

//   // Apply storeIds filter
//   let salePersonIds = [];
//   if (storeIds && storeIds.length > 0) {
//     const storeIdsArray = Array.isArray(storeIds) ? storeIds : storeIds.split(",").map(id => id.trim());

//     // Validate storeIds format
//     if (!storeIdsArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
//       return next(new AppError("Invalid store ID format", 400));
//     }

//     // Log storeIds for debugging
//     console.log("storeIdsArray:", storeIdsArray);

//     // Find store assignments for the given store IDs
//     const storeAssigns = await StoreAssign.find({ store: { $in: storeIdsArray } }).lean();

//     if (!storeAssigns || storeAssigns.length === 0) {
//       console.log(`No store assignments found for storeIds: ${storeIdsArray}`);
//       return res.status(200).json({
//         status: true,
//         message: "No sale persons found for these stores",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage) || 1,
//         results: 0,
//         data: { salePerson: [] },
//       });
//     }

//     // Log raw store assignments
//     console.log("Raw store assignments:", storeAssigns.map(sa => ({
//       store: sa.store,
//       salePerson: sa.salePerson,
//     })));

//     // Collect salePerson IDs, handling array of ObjectIds
//     const salePersonObjectIds = [...new Set(
//       storeAssigns
//         .filter(sa => sa.salePerson)
//         .flatMap(sa => Array.isArray(sa.salePerson) ? sa.salePerson.map(id => id.toString()) : [sa.salePerson.toString()])
//     )];

//     // Log collected salePerson IDs
//     console.log("salePersonObjectIds:", salePersonObjectIds);

//     // Validate salePerson IDs
//     const validSalePersons = await SalePerson.find({ _id: { $in: salePersonObjectIds } }).select("_id").lean();
//     salePersonIds = validSalePersons.map(sp => sp._id.toString());

//     // Log valid salePerson IDs
//     console.log("Valid salePerson IDs:", salePersonIds);

//     if (salePersonIds.length === 0) {
//       console.log("No valid salePerson references found for store assignments");
//       return res.status(200).json({
//         status: true,
//         message: "No valid sale persons found for these stores",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage) || 1,
//         results: 0,
//         data: { salePerson: [] },
//       });
//     }

//     // Add salePerson IDs to filter
//     filter._id = { $in: salePersonIds };
//   }

//   // Apply date filter (QTD, MTD, YTD, CUSTOM)
//   if (dateFilter) {
//     const start = new Date();
//     const end = new Date();

//     switch (dateFilter.toUpperCase()) {
//       case "QTD":
//         if ([1, 2, 3].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 0, 1);
//           end.setUTCFullYear(currentYear, 2, 31);
//         } else if ([4, 5, 6].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 3, 1);
//           end.setUTCFullYear(currentYear, 5, 30);
//         } else if ([7, 8, 9].includes(currentMonth)) {
//           start.setUTCFullYear(currentYear, 6, 1);
//           end.setUTCFullYear(currentYear, 8, 30);
//         } else {
//           start.setUTCFullYear(currentYear, 9, 1);
//           end.setUTCFullYear(currentYear, 11, 31);
//         }
//         break;

//       case "MTD":
//         start.setUTCFullYear(currentYear, currentMonth - 1, 1);
//         end.setUTCFullYear(currentYear, currentMonth - 1, now.getDate());
//         break;

//       case "YTD":
//         if (currentMonth >= 4) {
//           start.setUTCFullYear(currentYear, 3, 1);
//         } else {
//           start.setUTCFullYear(currentYear - 1, 3, 1);
//         }
//         end.setUTCFullYear(currentYear, 2, 31);
//         break;

//       case "CUSTOM":
//         if (startDate) {
//           start.setTime(new Date(startDate).getTime());
//         } else {
//           return next(new AppError("startDate is required for CUSTOM date filter", 400));
//         }
//         if (endDate) {
//           end.setTime(new Date(endDate).getTime());
//         } else {
//           end.setUTCHours(23, 59, 59, 999);
//         }
//         break;

//       default:
//         return next(new AppError("Invalid date filter", 400));
//     }
//     start.setUTCHours(0, 0, 0, 0);
//     end.setUTCHours(23, 59, 59, 999);
//     filter.createdAt = { $gte: start, $lte: end };
//   }

//   // Pagination
//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     SalePerson,
//     null,
//     filter
//   );

//   // Fetch salespeople
//   const salePersons = await SalePerson.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt")
//     .select("name mobile userId email status createdAt")
//     .lean();

//   // Calculate stats and fetch store details for each salesperson
//   const salePersonStats = await Promise.all(
//     salePersons.map(async (sp) => {
//       // Fetch user plans for the salesperson
//       const userPlans = await UserPlan.find({ salePersonId: sp.userId, status: { $ne: "Initiated" } }).lean();
//       const planCount = userPlans.length;
//       const userPlanIds = userPlans.map((up) => up._id);

//       // Fetch EMI lists for all plans
//       const emiLists = await EmiList.find({ userPlan: { $in: userPlanIds } }).lean();

//       // Total Installment Value
//       const totalInstallmentValue = emiLists.reduce((sum, emiList) => {
//         return (
//           sum +
//           emiList.emiList.reduce((emiSum, emi) => {
//             return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
//           }, 0)
//         );
//       }, 0);

//       // Foreclosed Plans
//       const foreclosedPlans = userPlans.filter((up) => up.status === "Forclosed");
//       const foreclosedPlanCount = foreclosedPlans.length;
//       const foreclosedPlanIds = foreclosedPlans.map((up) => up._id);
//       const foreclosedInstallmentValue = emiLists
//         .filter((emiList) => foreclosedPlanIds.includes(emiList.userPlan))
//         .reduce((sum, emiList) => {
//           return (
//             sum +
//             emiList.emiList.reduce((emiSum, emi) => {
//               return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
//             }, 0)
//           );
//         }, 0);

//       // Active/Completed Plans
//       const activeCompletedPlans = userPlans.filter((up) =>
//         ["Active", "Completed"].includes(up.status)
//       );
//       const activeCompletedPlanCount = activeCompletedPlans.length;
//       const activeCompletedPlanIds = activeCompletedPlans.map((up) => up._id);
//       const activeCompletedInstallmentValue = emiLists
//         .filter((emiList) => activeCompletedPlanIds.includes(emiList.userPlan))
//         .reduce((sum, emiList) => {
//           return (
//             sum +
//             emiList.emiList.reduce((emiSum, emi) => {
//               return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
//             }, 0)
//           );
//         }, 0);

//       // Monthly Breakdown (April to March)
//       const fiscalYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
//       const monthlyStats = Array.from({ length: 12 }, (_, i) => {
//         const monthIndex = (3 + i) % 12; // April (3) to March (2)
//         const monthName = new Date(0, monthIndex).toLocaleString("en", { month: "long" });
//         const monthStart = new Date(fiscalYearStart, monthIndex, 1);
//         const monthEnd = new Date(fiscalYearStart, monthIndex + 1, 0, 23, 59, 59, 999);

//         // Plan count based on plan creation date
//         const monthPlans = userPlans.filter((up) => {
//           const createdAt = new Date(up.createdAt);
//           return createdAt >= monthStart && createdAt <= monthEnd;
//         });
//         const monthPlanCount = monthPlans.length;

//         // Installment value based on payment date
//         const monthInstallmentValue = emiLists.reduce((sum, emiList) => {
//           return (
//             sum +
//             emiList.emiList.reduce((emiSum, emi) => {
//               const paidDate = emi.paidDate ? new Date(emi.paidDate) : null;
//               if (
//                 emi.status === "Paid" &&
//                 paidDate &&
//                 paidDate >= monthStart &&
//                 paidDate <= monthEnd
//               ) {
//                 return emiSum + (emi.monthlyAdvance || 0);
//               }
//               return emiSum;
//             }, 0)
//           );
//         }, 0);

//         return {
//           month: monthName,
//           planCount: monthPlanCount,
//           installmentValue: monthInstallmentValue,
//         };
//       });

//       // Fetch store details for the salesperson
//       const storeAssigns = await StoreAssign.find({ salePerson: sp._id })
//         .populate({
//           path: "store",
//           select: "address",
//           populate: {
//             path: "location",
//             select: "name state",
//           },
//         })
//         .lean();

//       const stores = [...new Set(
//         storeAssigns
//           .filter((sa) => sa.store && sa.store.location)
//           .map((sa) => ({
//             storeId: sa.store._id.toString(),
//             address: sa.store.address,
//             locationName: sa.store.location.name,
//             state: sa.store.location.state,
//           }))
//       )];

//       return {
//         salePerson: {
//           _id: sp._id,
//           name: sp.name,
//           mobile: sp.mobile,
//           userId: sp.userId,
//           email: sp.email,
//           status: sp.status,
//           createdAt: sp.createdAt,
//           stores,
//         },
//         stats: {
//           totalPlanCount: planCount,
//           totalInstallmentValue,
//           foreclosedPlanCount,
//           foreclosedInstallmentValue,
//           activeCompletedPlanCount,
//           activeCompletedInstallmentValue,
//           monthlyStats,
//         },
//       };
//     })
//   );

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: parseInt(currentPage) || 1,
//     results: salePersonStats.length,
//     data: {
//       salePerson: salePersonStats,
//     },
//   });
// });







const mongoose = require("mongoose");
const SalePerson = require("../../../models/salePerson");
const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const StoreAssign = require("../../../models/storeAssign");
const Store = require("../../../models/store");
const Location = require("../../../models/location");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const pagination = require("../../../utils/pagination");

exports.getAllSalePersonDetail = catchAsync(async (req, res, next) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    status,
    storeIds,
    salePersonIds,
    dateFilter,
  } = req.body;

  // Define currentMonth and currentYear at the start
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12 (January is 1)
  const currentYear = now.getFullYear();

  let filter = {};

  // Apply name, mobile, or userId search filter
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { userId: { $regex: search, $options: "i" } },
    ];
  }

  // Apply status filter
  if (status) {
    filter.status = status;
  }

  // Apply storeIds and salePersonIds filters
  let filteredSalePersonIds = [];
  if ((storeIds && storeIds.length > 0) || (salePersonIds && salePersonIds.length > 0)) {
    let storeSalePersonIds = [];
    let directSalePersonIds = [];

    // Handle storeIds filter
    if (storeIds && storeIds.length > 0) {
      const storeIdsArray = Array.isArray(storeIds) ? storeIds : storeIds.split(",").map(id => id.trim());

      // Validate storeIds format
      if (!storeIdsArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
        return next(new AppError("Invalid store ID format", 400));
      }

      // Log storeIds for debugging
      console.log("storeIdsArray:", storeIdsArray);

      // Find store assignments for the given store IDs
      const storeAssigns = await StoreAssign.find({ store: { $in: storeIdsArray } }).lean();

      if (!storeAssigns || storeAssigns.length === 0) {
        console.log(`No store assignments found for storeIds: ${storeIdsArray}`);
        return res.status(200).json({
          status: true,
          message: "No store assignments found for these stores",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { salePerson: [] },
        });
      }

      // Log raw store assignments
      console.log("Raw store assignments:", storeAssigns.map(sa => ({
        store: sa.store,
        salePerson: sa.salePerson,
      })));

      // Collect salePerson IDs
      storeSalePersonIds = [...new Set(
        storeAssigns
          .filter(sa => sa.salePerson)
          .flatMap(sa => Array.isArray(sa.salePerson) ? sa.salePerson.map(id => id.toString()) : [sa.salePerson.toString()])
      )];

      // Log collected salePerson IDs
      console.log("storeSalePersonIds:", storeSalePersonIds);

      if (storeSalePersonIds.length === 0) {
        console.log("No salePerson references found in store assignments");
        return res.status(200).json({
          status: true,
          message: "No sale persons found for these stores",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { salePerson: [] },
        });
      }
    }

    // Handle salePersonIds filter
    if (salePersonIds && salePersonIds.length > 0) {
      const salePersonIdsArray = Array.isArray(salePersonIds) ? salePersonIds : salePersonIds.split(",").map(id => id.trim());

      // Log salePersonIds for debugging
      console.log("salePersonIdsArray:", salePersonIdsArray);

      // Find SalePerson records by userId
      const salePersons = await SalePerson.find({
        userId: { $in: salePersonIdsArray },
      }).select("_id").lean();

      directSalePersonIds = salePersons.map(sp => sp._id.toString());

      // Log direct salePerson IDs
      console.log("directSalePersonIds:", directSalePersonIds);

      if (directSalePersonIds.length === 0) {
        console.log("No sale persons found for the provided salePersonIds");
        return res.status(200).json({
          status: true,
          message: "No sale persons found for these salePerson IDs",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { salePerson: [] },
        });
      }
    }

    // Combine filters: intersect IDs if both storeIds and salePersonIds are provided
    if (storeIds && storeIds.length > 0 && salePersonIds && salePersonIds.length > 0) {
      filteredSalePersonIds = storeSalePersonIds.filter(id => directSalePersonIds.includes(id));
    } else if (storeIds && storeIds.length > 0) {
      filteredSalePersonIds = storeSalePersonIds;
    } else {
      filteredSalePersonIds = directSalePersonIds;
    }

    if (filteredSalePersonIds.length === 0) {
      console.log("No sale persons found matching the provided filters");
      return res.status(200).json({
        status: true,
        message: "No sale persons found matching the provided filters",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage) || 1,
        results: 0,
        data: { salePerson: [] },
      });
    }

    // Add salePerson IDs to filter
    filter._id = { $in: filteredSalePersonIds };
  }

  // Apply date filter (QTD, MTD, YTD, CUSTOM)
  if (dateFilter) {
    const start = new Date();
    const end = new Date();

    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([1, 2, 3].includes(currentMonth)) {
          start.setUTCFullYear(currentYear, 0, 1);
          end.setUTCFullYear(currentYear, 2, 31);
        } else if ([4, 5, 6].includes(currentMonth)) {
          start.setUTCFullYear(currentYear, 3, 1);
          end.setUTCFullYear(currentYear, 5, 30);
        } else if ([7, 8, 9].includes(currentMonth)) {
          start.setUTCFullYear(currentYear, 6, 1);
          end.setUTCFullYear(currentYear, 8, 30);
        } else {
          start.setUTCFullYear(currentYear, 9, 1);
          end.setUTCFullYear(currentYear, 11, 31);
        }
        break;

      case "MTD":
        start.setUTCFullYear(currentYear, currentMonth - 1, 1);
        end.setUTCFullYear(currentYear, currentMonth - 1, now.getDate());
        break;

      case "YTD":
        if (currentMonth >= 4) {
          start.setUTCFullYear(currentYear, 3, 1);
        } else {
          start.setUTCFullYear(currentYear - 1, 3, 1);
        }
        end.setUTCFullYear(currentYear, 2, 31);
        break;

      case "CUSTOM":
        if (startDate) {
          start.setTime(new Date(startDate).getTime());
        } else {
          return next(new AppError("startDate is required for CUSTOM date filter", 400));
        }
        if (endDate) {
          end.setTime(new Date(endDate).getTime());
        } else {
          end.setUTCHours(23, 59, 59, 999);
        }
        break;

      default:
        return next(new AppError("Invalid date filter", 400));
    }
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    SalePerson,
    null,
    filter
  );

  // Fetch salespeople
  const salePersons = await SalePerson.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt")
    .select("name mobile userId email status createdAt")
    .lean();

  // Calculate stats and fetch store details for each salesperson
  const salePersonStats = await Promise.all(
    salePersons.map(async (sp) => {
      // Fetch user plans for the salesperson
      const userPlans = await UserPlan.find({ salePersonId: sp.userId, status: { $ne: "Initiated" } }).lean();
      const planCount = userPlans.length;
      const userPlanIds = userPlans.map((up) => up._id);

      // Fetch EMI lists for all plans
      const emiLists = await EmiList.find({ userPlan: { $in: userPlanIds } }).lean();

      // Total Installment Value
      const totalInstallmentValue = emiLists.reduce((sum, emiList) => {
        return (
          sum +
          emiList.emiList.reduce((emiSum, emi) => {
            return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
          }, 0)
        );
      }, 0);

      // Foreclosed Plans
      const foreclosedPlans = userPlans.filter((up) => up.status === "Forclosed");
      const foreclosedPlanCount = foreclosedPlans.length;
      const foreclosedPlanIds = foreclosedPlans.map((up) => up._id);
      const foreclosedInstallmentValue = emiLists
        .filter((emiList) => foreclosedPlanIds.includes(emiList.userPlan))
        .reduce((sum, emiList) => {
          return (
            sum +
            emiList.emiList.reduce((emiSum, emi) => {
              return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
            }, 0)
          );
        }, 0);

      // Active/Completed Plans
      const activeCompletedPlans = userPlans.filter((up) =>
        ["Active", "Completed"].includes(up.status)
      );
      const activeCompletedPlanCount = activeCompletedPlans.length;
      const activeCompletedPlanIds = activeCompletedPlans.map((up) => up._id);
      const activeCompletedInstallmentValue = emiLists
        .filter((emiList) => activeCompletedPlanIds.includes(emiList.userPlan))
        .reduce((sum, emiList) => {
          return (
            sum +
            emiList.emiList.reduce((emiSum, emi) => {
              return emi.status === "Paid" ? emiSum + (emi.monthlyAdvance || 0) : emiSum;
            }, 0)
          );
        }, 0);

      // Monthly Breakdown (April to March)
      const fiscalYearStart = currentMonth >= 4 ? currentYear : currentYear - 1;
      const monthlyStats = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = (3 + i) % 12; // April (3) to March (2)
        const monthName = new Date(0, monthIndex).toLocaleString("en", { month: "long" });
        const monthStart = new Date(fiscalYearStart, monthIndex, 1);
        const monthEnd = new Date(fiscalYearStart, monthIndex + 1, 0, 23, 59, 59, 999);

        // Plan count based on plan creation date
        const monthPlans = userPlans.filter((up) => {
          const createdAt = new Date(up.createdAt);
          return createdAt >= monthStart && createdAt <= monthEnd;
        });
        const monthPlanCount = monthPlans.length;

        // Installment value based on payment date
        const monthInstallmentValue = emiLists.reduce((sum, emiList) => {
          return (
            sum +
            emiList.emiList.reduce((emiSum, emi) => {
              const paidDate = emi.paidDate ? new Date(emi.paidDate) : null;
              if (
                emi.status === "Paid" &&
                paidDate &&
                paidDate >= monthStart &&
                paidDate <= monthEnd
              ) {
                return emiSum + (emi.monthlyAdvance || 0);
              }
              return emiSum;
            }, 0)
          );
        }, 0);

        return {
          month: monthName,
          planCount: monthPlanCount,
          installmentValue: monthInstallmentValue,
        };
      });

      // Fetch store details for the salesperson
      const storeAssigns = await StoreAssign.find({ salePerson: sp._id })
        .populate({
          path: "store",
          select: "address",
          populate: {
            path: "location",
            select: "name state",
          },
        })
        .lean();

      const stores = [...new Set(
        storeAssigns
          .filter((sa) => sa.store && sa.store.location)
          .map((sa) => ({
            storeId: sa.store._id.toString(),
            address: sa.store.address,
            locationName: sa.store.location.name,
            state: sa.store.location.state,
          }))
      )];

      return {
        salePerson: {
          _id: sp._id,
          name: sp.name,
          mobile: sp.mobile,
          userId: sp.userId,
          email: sp.email,
          status: sp.status,
          createdAt: sp.createdAt,
          stores,
        },
        stats: {
          totalPlanCount: planCount,
          totalInstallmentValue,
          foreclosedPlanCount,
          foreclosedInstallmentValue,
          activeCompletedPlanCount,
          activeCompletedInstallmentValue,
          monthlyStats,
        },
      };
    })
  );

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: parseInt(currentPage) || 1,
    results: salePersonStats.length,
    data: {
      salePerson: salePersonStats,
    },
  });
});