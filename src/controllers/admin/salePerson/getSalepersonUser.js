const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");

exports.getUsersBySalesperson = catchAsync(async (req, res, next) => {
  const { salePersonId } = req.query;

  if (!salePersonId) {
    return res.status(400).json({
      status: false,
      message: "Sale Person ID is required.",
    });
  }

  const { search } = req.query;

  const filter = { salePersonId };

  if (search) {
    filter["user.name"] = { $regex: search, $options: "i" };
  }

  const userPlans = await UserPlan.find(filter)
    .populate("user", "name mobile email profileImage")
    .sort("-createdAt");

  const uniqueUsers = [];
  const seenUsers = new Set();

  userPlans.forEach((plan) => {
    const userIdentifier = plan.user.mobile;
    if (!seenUsers.has(userIdentifier)) {
      seenUsers.add(userIdentifier);
      uniqueUsers.push({
        userId: plan.user._id,
        userName: plan.user.name || "",
        mobile: plan.user.mobile || "",
        email: plan.user.email || "",
        profileImage: plan.user.profileImage || "",
      });
    }
  });

  res.status(200).json({
    status: true,
    totalResult: uniqueUsers.length,
    results: uniqueUsers.length,
    data: {
      users: uniqueUsers,
    },
  });
});
