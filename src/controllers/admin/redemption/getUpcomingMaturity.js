// const UserPlan = require("../../../models/userPlan");
// const PlanDock = require("../../../models/planDock");
// const EmiList = require("../../../models/emiList");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");
// const AppError = require("../../../utils/AppError");

// exports.getUpcomingMaturity = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//   } = req.query;

//   const { salePersonId } = req.query;
//   const dockFilter={}


//   if(salePersonId){
//     dockFilter.salePersonId=salePersonId
//   }

//   const filter = {
//     isRedem: false,
//   };

//   if (startDate) {
//     filter.planStartDate = { $gte: new Date(startDate) };
//   }

//   if (endDate) {
//     filter.planEndDate = { $lte: new Date(endDate) };
//   }

//   const planDockIds = await PlanDock.find(dockFilter).distinct("_id");

//   if (planDockIds.length === 0) {
//     return next(new AppError("No active user found for the salesperson", 404));
//   }

//   filter.planDock = { $in: planDockIds };

//   const userPlansWithElevenEMIs = await EmiList.aggregate([
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
//         paidCount: { $sum: 1 },
//       },
//     },
//     {
//       $match: { paidCount: 10 },
//     },
//     {
//       $project: { _id: 1 },
//     },
//   ]);

//   const eligibleUserPlanIds = userPlansWithElevenEMIs.map((plan) => plan._id);

//   if (eligibleUserPlanIds.length === 0) {
//     return next(new AppError("No pending redemptions found", 404));
//   }

//   filter._id = { $in: eligibleUserPlanIds };

//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     UserPlan,
//     null,
//     filter
//   );

//   const pendingRedemptions = await UserPlan.find(filter)
//     .populate({
//       path: "user",
//       select: "name email mobile city state country redemptionDate",
//       match: search ? { name: { $regex: search, $options: "i" } } : {},
//     })
//     .populate("planDock", "name email mobile")
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   const filteredPlans = pendingRedemptions.filter((plan) => plan.user);

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: filteredPlans.length,
//     data: filteredPlans,
//   });
// });



const UserPlan = require("../../../models/userPlan");
const PlanDock = require("../../../models/planDock");
const EmiList = require("../../../models/emiList");
const SalePerson = require("../../../models/salePerson");
const StoreAssign = require("../../../models/storeAssign");
const User = require("../../../models/user");
const mongoose = require("mongoose");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const AppError = require("../../../utils/AppError");

exports.getUpcomingMaturity = catchAsync(async (req, res, next) => {
  const {
    search,
    dateFilter,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    storeIds,
    salePersonIds,
  } = req.body;

  const filter = {
    isRedem: false,
  };

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
          currentPage: parseInt(currentPage) || 1,
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
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: [],
        });
      }

      // Find user plans for the collected salePerson userIds
      const storeUserPlans = await UserPlan.find({
        salePersonId: { $in: storeSalePersonIds },
        isRedem: false,
      }).select("user");

      // Extract unique user IDs
      storeUserIds = [...new Set(storeUserPlans.map((plan) => plan.user.toString()))];

      if (storeUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No upcoming maturity plans found for these stores.",
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
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: [],
        });
      }

      // Find user plans for the collected salePerson userIds
      const salePersonUserPlans = await UserPlan.find({
        salePersonId: { $in: validSalePersonIds },
        isRedem: false,
      }).select("user");

      // Extract unique user IDs
      salePersonUserIds = [...new Set(salePersonUserPlans.map((plan) => plan.user.toString()))];

      if (salePersonUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No upcoming maturity plans found for these sale persons.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
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
        message: "No upcoming maturity plans found matching the provided filters.",
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

  // Find plans with exactly 10 paid EMIs
  const userPlansWithTenEMIs = await EmiList.aggregate([
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
      $match: { paidCount: 10 },
    },
    {
      $project: { _id: 1 },
    },
  ]);

  const eligibleUserPlanIds = userPlansWithTenEMIs.map((plan) => plan._id);

  if (eligibleUserPlanIds.length === 0) {
    return res.status(200).json({
      status: true,
      message: "No upcoming maturity plans found.",
      totalResult: 0,
      totalPage: 0,
      currentPage: parseInt(currentPage) || 1,
      results: 0,
      data: [],
    });
  }

  // Intersect with eligibleUserPlanIds
  filter._id = { $in: eligibleUserPlanIds };

  // Apply pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    UserPlan,
    null,
    filter
  );

  // Fetch upcoming maturity plans
  const pendingRedemptions = await UserPlan.find(filter)
    .populate({
      path: "user",
      match: search ? { name: { $regex: search, $options: "i" } } : {},
    })
    .populate({
      path: "planDock",
    })
    .populate("plan","name")
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  // Filter out plans where user is null and add storeLocation and salePersonName
  const filteredPlans = await Promise.all(
    pendingRedemptions
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