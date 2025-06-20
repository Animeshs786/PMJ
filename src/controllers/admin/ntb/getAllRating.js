// const User = require("../../../models/user");
// const Share = require("../../../models/share");
// const SalePerson = require("../../../models/salePerson");
// const Rating = require("../../../models/ratting");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const mongoose = require("mongoose");

// exports.getAllRatingForAdmin = catchAsync(async (req, res, next) => {
//   const {
//     page: currentPage = 1,
//     limit: currentLimit = 10,
//     search,
//     startDate,
//     endDate,
//     dateFilter,
//     salePerson,
//   } = req.body;

//   // Initialize filter object
//   const filter = {};

//   // SalePerson Filter
//   let userIds = null;
//   if (salePerson) {
//     const salePersonExists = await SalePerson.findById(salePerson);
//     if (!salePersonExists) {
//       return next(new AppError("Invalid salePerson ID.", 400));
//     }
//     const shares = await Share.find({ salePerson });
//     if (!shares.length) {
//       return res.status(200).json({
//         status: true,
//         message: "No ratings found for the specified SalePerson",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         limit: parseInt(currentLimit),
//         data: [],
//       });
//     }
//     userIds = await Promise.all(
//       shares.map(async (share) => {
//         const user = await User.findOne({ mobile: share.mobile }).select("_id");
//         return user?._id;
//       })
//     );
//     const validUserIds = userIds.filter(Boolean);
//     if (!validUserIds.length) {
//       return res.status(200).json({
//         status: true,
//         message: "No users found for the specified SalePerson",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         limit: parseInt(currentLimit),
//         data: [],
//       });
//     }
//     filter.user = { $in: validUserIds };
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

//   // Search Filter Logic for User (name, email, mobile), SalePerson (name, email, mobile, userId), and Rating (message)
//   if (search) {
//     const userFilter = {
//       $or: [
//         { name: { $regex: search, $options: "i" } },
//         { email: { $regex: search, $options: "i" } },
//         { mobile: { $regex: search, $options: "i" } },
//       ],
//     };
//     if (userIds) {
//       userFilter._id = { $in: userIds };
//     }
//     const matchingUsers = await User.find(userFilter).select("_id");

//     // Search SalePerson fields (skip if salePerson is provided)
//     let salePersonUserIds = [];
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
//         const salePersonShares = await Share.find({
//           salePerson: { $in: matchingSalePersons.map((sp) => sp._id) },
//         });
//         const salePersonUserIdsTemp = await Promise.all(
//           salePersonShares.map(async (share) => {
//             const user = await User.findOne({ mobile: share.mobile }).select(
//               "_id"
//             );
//             return user?._id;
//           })
//         );
//         salePersonUserIds = salePersonUserIdsTemp.filter(Boolean);
//       }
//     }

//     // Search Rating message
//     const ratingFilter = { message: { $regex: search, $options: "i" } };
//     if (userIds) {
//       ratingFilter.user = { $in: userIds };
//     }
//     const messageRatings = await Rating.find(ratingFilter).select("user");

//     // Combine all matching user IDs
//     const allUserIds = [
//       ...new Set([
//         ...matchingUsers.map((u) => u._id.toString()),
//         ...salePersonUserIds.map((id) => id.toString()),
//         ...messageRatings.map((r) => r.user.toString()),
//       ]),
//     ].map((id) => mongoose.Types.ObjectId(id));

//     if (allUserIds.length > 0) {
//       filter.user = { $in: allUserIds };
//     } else {
//       // If no users match, return empty result to avoid fetching all ratings
//       return res.status(200).json({
//         status: true,
//         message: "No ratings found matching the search criteria",
//         totalResult: 0,
//         totalPage: 0,
//         currentPage: parseInt(currentPage),
//         limit: parseInt(currentLimit),
//         data: [],
//       });
//     }
//   }

//   // Pagination
//   const totalResult = await Rating.countDocuments(filter);
//   const limit = parseInt(currentLimit);
//   const skip = (parseInt(currentPage) - 1) * limit;
//   const totalPage = Math.ceil(totalResult / limit);

//   // Fetch ratings
//   const ratings = await Rating.find(filter)
//     .populate("user", "name email city state country mobile")
//     .skip(skip)
//     .limit(limit)
//     .sort("-createdAt");

//   res.status(200).json({
//     status: true,
//     message: "Ratings fetched successfully",
//     totalResult,
//     totalPage,
//     currentPage: parseInt(currentPage),
//     limit,
//     data:
//       ratings.length > 0
//         ? ratings.map((rating) => ({
//             ratingId: rating._id,
//             user: rating.user,
//             rating: rating.rating,
//             message: rating.message,
//             createdAt: rating.createdAt,
//           }))
//         : [],
//   });
// });


const mongoose = require("mongoose");
const User = require("../../../models/user");
const Rating = require("../../../models/ratting");
const Share = require("../../../models/share");
const SalePerson = require("../../../models/salePerson");
const StoreAssign = require("../../../models/storeAssign");
const UserAssign = require("../../../models/userAssign");
const UserPlan = require("../../../models/userPlan");
const PlanDock = require("../../../models/planDock");
const EmiList = require("../../../models/emiList");
const CollectionAgent = require("../../../models/collectionAgent");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getAllRatingForAdmin = catchAsync(async (req, res, next) => {
  const {
    page: currentPage = 1,
    limit: currentLimit = 10,
    search,
    startDate,
    endDate,
    dateFilter,
    salePerson,
    userId,
    planDock,
    collectionAgent,
    storeIds,
    salePersonIds,
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
  }

  // SalePerson Filter
  if (salePerson) {
    const salePersonExists = await SalePerson.findOne({ userId: salePerson });
    if (!salePersonExists) {
      return next(new AppError("Invalid salePerson.", 400));
    }
    const shares = await Share.find({ salePerson: salePersonExists._id });
    if (!shares.length) {
      return res.status(200).json({
        status: true,
        message: "No ratings found for the specified SalePerson",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        limit: parseInt(currentLimit),
        data: [],
      });
    }
    const userIds = await Promise.all(
      shares.map(async (share) => {
        const user = await User.findOne({ mobile: share.mobile }).select("_id");
        return user?._id;
      })
    );
    const validUserIds = userIds.filter(Boolean);
    if (!validUserIds.length) {
      return res.status(200).json({
        status: true,
        message: "No users found for the specified SalePerson",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        limit: parseInt(currentLimit),
        data: [],
      });
    }
    if (filter.user) {
      filter.user = { $in: validUserIds.filter(id => id.equals(filter.user)) };
      if (!filter.user.$in.length) {
        return res.status(200).json({
          status: true,
          message: "No ratings found for the specified SalePerson and user",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          limit: parseInt(currentLimit),
          data: [],
        });
      }
    } else {
      filter.user = { $in: validUserIds };
    }
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
          limit: parseInt(currentLimit),
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
          limit: parseInt(currentLimit),
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
          limit: parseInt(currentLimit),
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
          limit: parseInt(currentLimit),
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
          limit: parseInt(currentLimit),
          data: [],
        });
      }
    }

    // Combine filters: intersect user IDs if both storeIds and salePersonIds are provided
    let combinedUserIds;
    if (storeIds && storeIds.length > 0 && salePersonIds && salePersonIds.length > 0) {
      combinedUserIds = storeUserIds.filter((id) => salePersonUserIds.includes(id));
    } else if (storeIds && storeIds.length > 0) {
      combinedUserIds = storeUserIds;
    } else {
      combinedUserIds = salePersonUserIds;
    }

    if (combinedUserIds.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No active user plans found matching the provided filters.",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        limit: parseInt(currentLimit),
        data: [],
      });
    }

    if (filter.user) {
      filter.user.$in = filter.user.$in.filter(id => combinedUserIds.includes(id.toString()));
      if (!filter.user.$in.length) {
        return res.status(200).json({
          status: true,
          message: "No ratings found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          limit: parseInt(currentLimit),
          data: [],
        });
      }
    } else {
      filter.user = { $in: combinedUserIds.map(id => new mongoose.Types.ObjectId(id)) };
    }
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
        limit: parseInt(currentLimit),
        data: [],
      });
    }
    const collectionAgentUserIds = userAssignments.map((ua) => ua.user);
    if (filter.user) {
      filter.user.$in = filter.user.$in.filter(id => collectionAgentUserIds.some(cid => cid.equals(id)));
      if (!filter.user.$in.length) {
        return res.status(200).json({
          status: true,
          message: "No ratings found matching the provided filters.",
          totalResult: 0,
          totalPage: 0,
          currentPage: parseInt(currentPage),
          limit: parseInt(currentLimit),
          data: [],
        });
      }
    } else {
      filter.user = { $in: collectionAgentUserIds };
    }
  }

  // Search Filter Logic for User, SalePerson, CollectionAgent, and Rating
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
      ],
    };

    const userFilter = { ...userMatch };
    if (filter.user) {
      userFilter._id = filter.user;
    }
    const matchingUsers = await User.find(userFilter).select("_id");

    let salePersonUserIds = [];
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
        const salePersonShares = await Share.find({
          salePerson: { $in: matchingSalePersons.map((sp) => sp._id) },
        });
        const salePersonUserIdsTemp = await Promise.all(
          salePersonShares.map(async (share) => {
            const user = await User.findOne({ mobile: share.mobile }).select("_id");
            return user?._id;
          })
        );
        salePersonUserIds = salePersonUserIdsTemp.filter(Boolean);
      }
    }

    const matchingCollectionAgents = await CollectionAgent.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");
    let collectionAgentUserIds = [];
    if (matchingCollectionAgents.length > 0) {
      const assignments = await UserAssign.find({
        collectionAgent: { $in: matchingCollectionAgents.map(ca => ca._id) },
      });
      collectionAgentUserIds = assignments.map((a) => a.user).filter(Boolean);
    }

    const messageRatings = await Rating.find({
      message: { $regex: search, $options: "i" },
      ...(filter.user ? { user: filter.user } : {}),
    }).select("user");

    const allUserIds = [
      ...new Set([
        ...matchingUsers.map((u) => u._id.toString()),
        ...salePersonUserIds.map((id) => id.toString()),
        ...collectionAgentUserIds.map((id) => id.toString()),
        ...messageRatings.map((r) => r.user.toString()),
      ]),
    ].map((id) => mongoose.Types.ObjectId(id));

    if (allUserIds.length > 0) {
      if (filter.user) {
        filter.user.$in = filter.user.$in.filter(id => allUserIds.some(aid => aid.equals(id)));
        if (!filter.user.$in.length) {
          return res.status(200).json({
            status: true,
            message: "No ratings found matching the search criteria",
            totalResult: 0,
            totalPage: 0,
            currentPage: parseInt(currentPage),
            limit: parseInt(currentLimit),
            data: [],
          });
        }
      } else {
        filter.user = { $in: allUserIds };
      }
    } else {
      return res.status(200).json({
        status: true,
        message: "No ratings found matching the search criteria",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage),
        limit: parseInt(currentLimit),
        data: [],
      });
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
  const totalResult = await Rating.countDocuments(filter);
  const limit = parseInt(currentLimit);
  const skip = (parseInt(currentPage) - 1) * limit;
  const totalPage = Math.ceil(totalResult / limit);

  // Fetch ratings
  const ratings = await Rating.find(filter)
    .populate({
      path: "user",
      select: "name email mobile city state country redemptionDate",
      match: userMatch,
    })
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  // Process ratings and include plan details
  const results = await Promise.all(
    ratings
      .filter((rating) => rating.user)
      .map(async (rating) => {
        const user = rating.user;

        // Find SalePerson via Share
        const userShare = await Share.findOne({ mobile: user.mobile }).populate("salePerson", "name userId _id");
        let salePersonDoc = userShare?.salePerson || null;

        // Fetch store location
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

        // Fetch active plans
        const userPlans = await UserPlan.find({
          user: user._id,
          status: "Active",
          ...(planDock ? { planDock: new mongoose.Types.ObjectId(planDock) } : {}),
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

        return {
          _id: rating._id,
          user: {
            _id: user._id,
            name: user.name || "",
            email: user.email || "",
            mobile: user.mobile,
            city: user.city || "",
            state: user.state || "",
            country: user.country || "",
            redemptionDate: user.redemptionDate || null,
          },
          salePersonName: salePersonDoc ? salePersonDoc.name : "",
          salePersonId: salePersonDoc ? salePersonDoc.userId : "",
          storeLocation,
          createdAt: rating.createdAt,
          totalActivePlans: activePlansMap[user._id.toString()] || 0,
          plans: enrichedPlans.length > 0 ? enrichedPlans : [],
          rating: rating.rating,
          message: rating.message,
        };
      })
  );

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: parseInt(currentPage),
    limit: parseInt(currentLimit),
    results: results.length,
    data: results,
  });
});