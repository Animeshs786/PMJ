// const mongoose = require("mongoose");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const pagination = require("../../../utils/pagination");
// const User = require("../../../models/user");
// const StoreAssign = require("../../../models/storeAssign");
// const UserPlan = require("../../../models/userPlan");
// const SalePerson = require("../../../models/salePerson");
// const Store = require("../../../models/store");
// const Location = require("../../../models/location");
// const UserAssign = require("../../../models/userAssign");
// const CollectionAgent = require("../../../models/collectionAgent");

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const {
//     search,
//     startDate,
//     endDate,
//     page: currentPage,
//     limit: currentLimit,
//     status,
//     storeIds,
//     salePersonIds,
//     collectionAgentIds,
//   } = req.body;

//   let userIds = [];
//   let filter = {};

//   // Handle search by name, mobile, or digitalAccount
//   if (search) {
//     filter.$or = [
//       { name: { $regex: search, $options: "i" } },
//       { mobile: { $regex: search, $options: "i" } },
//       { digitalAccount: { $regex: search, $options: "i" } },
//     ];
//   }

//   // Handle status filter
//   if (status) {
//     filter.status = status;
//   }

//   // Handle date range filter
//   if (startDate) {
//     filter.createdAt = { $gte: new Date(startDate) };
//   }
//   if (endDate) {
//     filter.createdAt = filter.createdAt || {};
//     filter.createdAt.$lte = new Date(endDate);
//   }

//   // Handle storeIds, salePersonIds, and collectionAgentIds filters
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
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { users: [] },
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
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { users: [] },
//         });
//       }

//       // Find user plans for the collected salePerson userIds
//       const storeUserPlans = await UserPlan.find({
//         salePersonId: { $in: storeSalePersonIds },
//       }).select("user");

//       // Extract unique user IDs
//       storeUserIds = [
//         ...new Set(storeUserPlans.map((plan) => plan.user.toString())),
//       ];

//       if (storeUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No users found for these stores.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { users: [] },
//         });
//       }
//     }

//     // Handle salePersonIds filter
//     if (salePersonIds?.length > 0) {
//       const salePersonIdsArray = Array.isArray(salePersonIds)
//         ? salePersonIds
//         : salePersonIds.split(",").map((id) => id.trim());

//       // Find user plans for the collected salePerson userIds
//       const salePersonUserPlans = await UserPlan.find({
//         salePersonId: { $in: salePersonIdsArray },
//       }).select("user");

//       // Extract unique user IDs
//       salePersonUserIds = [
//         ...new Set(salePersonUserPlans.map((plan) => plan.user.toString())),
//       ];

//       if (salePersonUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No users found for these sale persons.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { users: [] },
//         });
//       }
//     }

//     // Handle collectionAgentIds filter
//     if (collectionAgentIds?.length > 0) {
//       const collectionAgentIdsArray = Array.isArray(collectionAgentIds)
//         ? collectionAgentIds
//         : collectionAgentIds.split(",").map((id) => id.trim());

//       // Validate collectionAgentIds format
//       if (!collectionAgentIdsArray.every((id) => mongoose.Types.ObjectId.isValid(id))) {
//         return next(new AppError("Invalid collection agent ID format.", 400));
//       }

//       // Find user assignments for the given collectionAgent IDs
//       const userAssignments = await UserAssign.find({
//         collectionAgent: { $in: collectionAgentIdsArray },
//       });

//       if (!userAssignments.length) {
//         return res.status(200).json({
//           status: true,
//           message: "No users assigned to these collection agents.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { users: [] },
//         });
//       }

//       // Extract unique user IDs
//       collectionAgentUserIds = [
//         ...new Set(userAssignments.map((ua) => ua.user.toString())),
//       ];

//       if (collectionAgentUserIds.length === 0) {
//         return res.status(200).json({
//           status: true,
//           message: "No users assigned to these collection agents.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { users: [] },
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
//           message: "No users found matching the provided filters.",
//           totalResult: 0,
//           totalPage: 0,
//           currentPage: parseInt(currentPage) || 1,
//           results: 0,
//           data: { users: [] },
//         });
//       }

//       // Add user IDs to filter
//       filter._id = {
//         $in: combinedUserIds.map((id) => new mongoose.Types.ObjectId(id)),
//       };
//     }
//   }

//   // Pagination
//   const { limit, skip, totalResult, totalPage } = await pagination(
//     currentPage,
//     currentLimit,
//     User,
//     null,
//     filter
//   );

//   // Fetch users with applied filters
//   const users = await User.find(filter)
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   // Fetch store, salesperson, and collection agent details for each user
//   const userData = await Promise.all(
//     users.map(async (user) => {
//       // Find all user plans for the current user
//       const userPlans = await UserPlan.find({ user: user._id }).select(
//         "salePersonId"
//       );

//       // Get unique salePerson IDs from user plans
//       const salePersonIds = [
//         ...new Set(
//           userPlans
//             .filter((plan) => plan.salePersonId && plan.salePersonId !== " ")
//             .map((plan) => plan.salePersonId)
//         ),
//       ];

//       // Fetch salesperson details using userId
//       const salePersons =
//         salePersonIds.length > 0
//           ? await SalePerson.find({ userId: { $in: salePersonIds } })
//               .select("name userId _id")
//               .lean()
//           : [];

//       const salePersonDetails = salePersons.map((sp) => ({
//         salePersonId: sp.userId,
//         salePersonName: sp.name,
//       }));

//       // Get store assignments for these salespeople using SalePerson._id
//       const storeAssigns =
//         salePersons.length > 0
//           ? await StoreAssign.find({
//               salePerson: { $in: salePersons.map((sp) => sp._id) },
//             })
//               .populate({
//                 path: "store",
//                 select: "address",
//                 populate: {
//                   path: "location",
//                   select: "name state",
//                 },
//               })
//               .lean()
//           : [];

//       // Extract store details
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

//       // Find user assignments for the current user to get collection agents
//       const userAssignments = await UserAssign.find({ user: user._id }).select(
//         "collectionAgent"
//       );

//       // Get unique collection agent IDs
//       const collectionAgentIds = [
//         ...new Set(
//           userAssignments
//             .filter((ua) => ua.collectionAgent)
//             .map((ua) => ua.collectionAgent.toString())
//         ),
//       ];

//       // Fetch collection agent details
//       const collectionAgents =
//         collectionAgentIds.length > 0
//           ? await CollectionAgent.find({ _id: { $in: collectionAgentIds } })
//               .select("name _id")
//               .lean()
//           : [];

//       const collectionAgentDetails = collectionAgents.map((ca) => ({
//         collectionAgentId: ca._id.toString(),
//         collectionAgentName: ca.name,
//       }));

//       return {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         mobile: user.mobile,
//         state: user.state,
//         city: user.city,
//         pincode: user.pincode,
//         dob: user.dob,
//         country: user.country,
//         digitalAccount: user.digitalAccount,
//         createdAt: user.createdAt,
//         stores,
//         salePersons: salePersonDetails,
//         collectionAgents: collectionAgentDetails,
//       };
//     })
//   );

//   res.status(200).json({
//     status: true,
//     totalResult,
//     totalPage,
//     currentPage: currentPage ? parseInt(currentPage) : 1,
//     results: userData.length,
//     data: {
//       users: userData,
//     },
//   });
// });



const mongoose = require("mongoose");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");
const User = require("../../../models/user");
const StoreAssign = require("../../../models/storeAssign");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson");
const Store = require("../../../models/store");
const Location = require("../../../models/location");
const UserAssign = require("../../../models/userAssign");
const CollectionAgent = require("../../../models/collectionAgent");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    status,
    storeIds,
    salePersonIds,
    collectionAgentIds,
  } = req.body;

  let userIds = [];
  let filter = {};

  // Handle search by name, mobile, or digitalAccount
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { digitalAccount: { $regex: search, $options: "i" } },
    ];
  }

  // Handle status filter
  if (status) {
    filter.status = status;
  }

  // Handle date range filter
  if (startDate) {
    filter.createdAt = { $gte: new Date(startDate) };
  }
  if (endDate) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = new Date(endDate);
  }

  // Handle storeIds, salePersonIds, and collectionAgentIds filters
  if (
    storeIds?.length > 0 ||
    salePersonIds?.length > 0 ||
    collectionAgentIds?.length > 0
  ) {
    let storeUserIds = [];
    let salePersonUserIds = []; // Renamed for clarity
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
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { users: [] },
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
          data: { users: [] },
        });
      }

      // Find user plans for the collected salePerson userIds
      const storeUserPlans = await UserPlan.find({
        salePersonId: { $in: storeSalePersonIds },
      }).select("user");

      // Extract unique user IDs
      storeUserIds = [
        ...new Set(storeUserPlans.map((plan) => plan.user.toString())),
      ];

      if (storeUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No users found for these stores.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { users: [] },
        });
      }
    }

    // Handle salePersonIds filter
    if (salePersonIds?.length > 0) {
      const salePersonIdsArray = Array.isArray(salePersonIds)
        ? salePersonIds
        : salePersonIds.split(",").map((id) => id.trim());

      // Find user plans for the collected salePersonIds
      const salePersonUserPlans = await UserPlan.find({
        salePersonId: { $in: salePersonIdsArray },
      }).select("user");

      // Extract unique user IDs
      salePersonUserIds = [
        ...new Set(salePersonUserPlans.map((plan) => plan.user.toString())),
      ];

      if (salePersonUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No users found for these sale persons.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { users: [] },
        });
      }
    }

    // Handle collectionAgentIds filter
    if (collectionAgentIds?.length > 0) {
      const collectionAgentIdsArray = Array.isArray(collectionAgentIds)
        ? collectionAgentIds
        : collectionAgentIds.split(",").map((id) => id.trim());

      // Validate collectionAgentIds format
      if (!collectionAgentIdsArray.every((id) => mongoose.Types.ObjectId.isValid(id))) {
        return next(new AppError("Invalid collection agent ID format.", 400));
      }

      // Find user assignments for the given collectionAgent IDs
      const userAssignments = await UserAssign.find({
        collectionAgent: { $in: collectionAgentIdsArray },
      });

      if (!userAssignments.length) {
        return res.status(200).json({
          status: true,
          message: "No users assigned to these collection agents.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { users: [] },
        });
      }

      // Extract unique user IDs
      collectionAgentUserIds = [
        ...new Set(userAssignments.map((ua) => ua.user.toString())),
      ];

      if (collectionAgentUserIds.length === 0) {
        return res.status(200).json({
          status: true,
          message: "No users assigned to these collection agents.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { users: [] },
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
          message: "No users found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage) || 1,
          results: 0,
          data: { users: [] },
        });
      }

      // Add user IDs to filter
      filter._id = {
        $in: combinedUserIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
  }

  // Pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    User,
    null,
    filter
  );

  // Fetch users with applied filters
  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  // Fetch store, salesperson, collection agent, and plan details for each user
  const userData = await Promise.all(
    users.map(async (user) => {
      // Find all user plans for the current user, excluding Initiated status
      const userPlans = await UserPlan.find({
        user: user._id,
        status: { $ne: "Initiated" },
      })
        .populate({
          path: "plan",
          select: "name", // Assuming Plan model has a name field
        })
        .lean();

      // Format plan details
      const planDetails = userPlans.map((plan) => ({
        planId: plan._id,
        planName: plan.plan?.name || "Unknown Plan",
        salePersonId: plan.salePersonId,
        planStartDate: plan.planStartDate,
        planEndDate: plan.planEndDate,
        maturityDate: plan.maturityDate,
        initialDiscount: plan.initialDiscount,
        firstDiscount: plan.firstDiscount,
        rewardAmount: plan.rewardAmount,
        amountAfterDiscount: plan.amountAfterDiscount,
        advancePaid: plan.advancePaid,
        overAllBenefits: plan.overAllBenefits,
        redemptionValue: plan.redemptionValue,
        advancePaymentNumber: plan.advancePaymentNumber,
        commitedAmount: plan.commitedAmount,
        status: plan.status,
        remark: plan.remark,
        isRedem: plan.isRedem,
        redemptionDate: plan.redemptionDate,
        discountPercentage: plan.discountPercentage,
        digitalAccount: plan.digitalAccount,
        createdAt: plan.createdAt,
      }));

      // Get unique salePerson IDs from user plans
      const salePersonIds = [
        ...new Set(
          userPlans
            .filter((plan) => plan.salePersonId && plan.salePersonId !== " ")
            .map((plan) => plan.salePersonId)
        ),
      ];

      // Fetch salesperson details using userId
      const salePersons =
        salePersonIds.length > 0
          ? await SalePerson.find({ userId: { $in: salePersonIds } })
              .select("name userId _id")
              .lean()
          : [];

      const salePersonDetails = salePersons.map((sp) => ({
        salePersonId: sp.userId,
        salePersonName: sp.name,
      }));

      // Get store assignments for these salespeople using SalePerson._id
      const storeAssigns =
        salePersons.length > 0
          ? await StoreAssign.find({
              salePerson: { $in: salePersons.map((sp) => sp._id) },
            })
              .populate({
                path: "store",
                select: "address",
                populate: {
                  path: "location",
                  select: "name state",
                },
              })
              .lean()
          : [];

      // Extract store details
      const stores = [
        ...new Set(
          storeAssigns
            .filter((sa) => sa.store && sa.store.location)
            .map((sa) => ({
              storeId: sa.store._id.toString(),
              address: sa.store.address,
              locationName: sa.store.location.name,
              state: sa.store.location.state,
            }))
        ),
      ];

      // Find user assignments for the current user to get collection agents
      const userAssignments = await UserAssign.find({ user: user._id }).select(
        "collectionAgent"
      );

      // Get unique collection agent IDs
      const collectionAgentIds = [
        ...new Set(
          userAssignments
            .filter((ua) => ua.collectionAgent)
            .map((ua) => ua.collectionAgent.toString())
        ),
      ];

      // Fetch collection agent details
      const collectionAgents =
        collectionAgentIds.length > 0
          ? await CollectionAgent.find({ _id: { $in: collectionAgentIds } })
              .select("name _id")
              .lean()
          : [];

      const collectionAgentDetails = collectionAgents.map((ca) => ({
        collectionAgentId: ca._id.toString(),
        collectionAgentName: ca.name,
      }));

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        state: user.state,
        city: user.city,
        pincode: user.pincode,
        dob: user.dob,
        country: user.country,
        digitalAccount: user.digitalAccount,
        createdAt: user.createdAt,
        stores,
        salePersons: salePersonDetails,
        collectionAgents: collectionAgentDetails,
        plans: planDetails, // New plans array
      };
    })
  );

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: userData.length,
    data: {
      users: userData,
    },
  });
});