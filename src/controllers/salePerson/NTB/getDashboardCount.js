// const UserPlan = require("../../../models/userPlan");
// const PlanDock = require("../../../models/planDock");
// const Share = require("../../../models/share");
// const Rating = require("../../../models/ratting");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const User = require("../../../models/user");

// exports.getDashboardCounts = catchAsync(async (req, res, next) => {
//   const salePersonId = req.user.userId;
//   const userId = req.user._id;

//   const planDockIds = await PlanDock.find({ salePersonId }).distinct("_id");

//   if (planDockIds.length === 0) {
//     return next(new AppError("No data found for the sale person", 404));
//   }

//   const activeUserFilter = { status: "Active", planDock: { $in: planDockIds } };
//   const enrollUserFilter = {
//     status: { $ne: "Initiated" },
//     planDock: { $in: planDockIds },
//   };

//   const shares = await Share.find({ salePerson: userId });

//   const userIds = await Promise.all(
//     shares.map(async (share) => {
//       const user = await User.findOne({ mobile: share.mobile }).select("_id");
//       return user?._id;
//     })
//   );

//   const validUserIds = userIds.filter(Boolean);

//   const filter = { user: { $in: validUserIds } };

//   const [
//     allActiveUserCount,
//     allEnrollUserCount,
//     allRatingCount,
//     allShareCount,
//     allDownloadListCount,
//   ] = await Promise.all([
//     UserPlan.countDocuments(activeUserFilter),
//     UserPlan.countDocuments(enrollUserFilter),
//     Rating.countDocuments(filter),
//     Share.countDocuments({ salePerson: userId }),
//     Share.countDocuments({
//       salePerson: userId,
//       mobile: { $exists: true },
//     }),
//   ]);

//   // Response
//   res.status(200).json({
//     status: true,
//     data: {
//       allActiveUserCount,
//       allEnrollUserCount,
//       allRatingCount,
//       allShareCount,
//       allDownloadListCount,
//     },
//   });
// });

const UserPlan = require("../../../models/userPlan");
const Share = require("../../../models/share");
const Rating = require("../../../models/ratting");
const catchAsync = require("../../../utils/catchAsync");
const User = require("../../../models/user");

exports.getDashboardCounts = catchAsync(async (req, res, next) => {
  const salePersonId = req.user.userId;
  const userId = req.user._id;

  const activeUserFilter = { status: "Active", salePersonId };
  const enrollUserFilter = { status: { $ne: "Initiated" }, salePersonId };

  const shares = await Share.find({ salePerson: userId });

  const userIds = await Promise.all(
    shares.map(async (share) => {
      const user = await User.findOne({ mobile: share.mobile }).select("_id");
      return user?._id;
    })
  );

  const validUserIds = userIds.filter(Boolean);

  const filter = { user: { $in: validUserIds } };

  const [
    allActiveUserCount,
    allEnrollUserCount,
    allRatingCount,
    allShareCount,
    allDownloadListCount,
  ] = await Promise.all([
    UserPlan.countDocuments(activeUserFilter),
    UserPlan.countDocuments(enrollUserFilter),
    Rating.countDocuments(filter),
    Share.countDocuments({ salePerson: userId }),
    Share.countDocuments({
      salePerson: userId,
      mobile: { $exists: true },
    }),
  ]);

  // Response
  res.status(200).json({
    status: true,
    data: {
      allActiveUserCount: allActiveUserCount || 0,
      allEnrollUserCount: allEnrollUserCount || 0,
      allRatingCount: allRatingCount || 0,
      allShareCount: allShareCount || 0,
      allDownloadListCount: allDownloadListCount || 0,
    },
  });
});

