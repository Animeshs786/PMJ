// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");

// exports.redemptionViewCount = catchAsync(async (req, res, next) => {
//   const salePersonId = req.user.userId;

//   // Fetch user plans with 11 paid EMIs
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
//       $match: { paidCount: 11 }, // 11 paid EMIs (including the reward)
//     },
//     {
//       $lookup: {
//         from: "userplans",
//         localField: "_id",
//         foreignField: "_id",
//         as: "userPlanData",
//       },
//     },
//     {
//       $unwind: "$userPlanData",
//     },
//     {
//       $match: {
//         "userPlanData.salePersonId": salePersonId, // Directly filter by salePersonId
//         "userPlanData.isRedem": false, // Ensure the plan is not redeemed
//       },
//     },
//   ]);

//   // Count pending redemptions
//   const pendingRedemptions = userPlansWithElevenEMIs.length;

//   // Fetch redeemed plans
//   const redeemed = await UserPlan.countDocuments({
//     salePersonId, // Directly filter by salePersonId
//     isRedeemedView: false,
//     isRedem: true,
//   });

//   // Fetch user plans with 10 paid EMIs (for maturity count)
//   const userPlansWithTenEMIs = await EmiList.aggregate([
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
//       $match: { paidCount: 10 }, // 10 paid EMIs (the 11th is the reward)
//     },
//     {
//       $lookup: {
//         from: "userplans",
//         localField: "_id",
//         foreignField: "_id",
//         as: "userPlanData",
//       },
//     },
//     {
//       $unwind: "$userPlanData",
//     },
//     {
//       $match: {
//         "userPlanData.salePersonId": salePersonId, // Directly filter by salePersonId
//         "userPlanData.isUpcomingMaturityView": false,
//         "userPlanData.isRedem": false,
//       },
//     },
//   ]);

//   const maturityCount = userPlansWithTenEMIs.length;

//   res.status(200).json({
//     status: true,
//     data: {
//       pendingRedemptions,
//       redeemed,
//       maturityCount,
//     },
//   });
// });

const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.redemptionViewCount = catchAsync(async (req, res, next) => {
  const salePersonId = req.user.userId;

  // Fetch user plans with 11 paid EMIs (for pending redemptions)
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
      $match: { paidCount: 11 }, // 11 paid EMIs (including the reward)
    },
    {
      $lookup: {
        from: "userplans",
        localField: "_id",
        foreignField: "_id",
        as: "userPlanData",
      },
    },
    {
      $unwind: "$userPlanData",
    },
    {
      $match: {
        "userPlanData.salePersonId": salePersonId, // Filter by salePersonId
        "userPlanData.isRedem": false, // Ensure the plan is not redeemed
        "userPlanData.isPendingRedeemView": false, // Only include if not viewed
      },
    },
  ]);

  // Count pending redemptions
  const pendingRedemptions = userPlansWithElevenEMIs.length;

  // Fetch redeemed plans (where isRedeemedView is false)
  const redeemed = await UserPlan.countDocuments({
    salePersonId, // Filter by salePersonId
    isRedem: true, // Ensure the plan is redeemed
    isRedeemedView: false, // Only include if not viewed
  });

  // Fetch user plans with 10 paid EMIs (for maturity count)
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
      $match: { paidCount: 10 }, // 10 paid EMIs (the 11th is the reward)
    },
    {
      $lookup: {
        from: "userplans",
        localField: "_id",
        foreignField: "_id",
        as: "userPlanData",
      },
    },
    {
      $unwind: "$userPlanData",
    },
    {
      $match: {
        "userPlanData.salePersonId": salePersonId, // Filter by salePersonId
        "userPlanData.isUpcomingMaturityView": false, // Only include if not viewed
        "userPlanData.isRedem": false, // Ensure the plan is not redeemed
      },
    },
  ]);

  const maturityCount = userPlansWithTenEMIs.length;

  res.status(200).json({
    status: true,
    data: {
      pendingRedemptions,
      redeemed,
      maturityCount,
    },
  });
});