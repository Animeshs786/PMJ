const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");

exports.getAllUsers = catchAsync(async (req, res) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    status,
  } = req.query;

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (status) {
    filter.status = status;
  }

  if (startDate) {
    filter.createdAt = { $gte: new Date(startDate) };
  }
  if (endDate) {
    filter.createdAt = { $lte: new Date(endDate) };
  }

  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    User,
    null,
    filter
  );

  const users = await User.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: users.length,
    data: {
      users,
    },
  });
});
modify this code first add date firlter in this
store filter and saleperson filter
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const StoreAssign = require("../../../models/storeAssign");
const UserPlan = require("../../../models/userPlan");

exports.getTotalUserByStore = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, storeId } = req.query;

  if (!storeId) {
    return next(new AppError("Store ID is required.", 400));
  }

  const storeAssign = await StoreAssign.findOne({ store: storeId }).populate(
    "salePerson"
  );

  if (
    !storeAssign ||
    !storeAssign.salePerson ||
    storeAssign.salePerson.length === 0
  ) {
    return next(new AppError("No sale persons found for this store.", 404));
  }

  const salePersonIds = storeAssign.salePerson.map((sp) => sp.userId);

  const userPlans = await UserPlan.find({
    salePersonId: { $in: salePersonIds },
  }).populate("user", "name mobile email");

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
      });
    }
  });

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = uniqueUsers.slice(startIndex, endIndex);

  res.status(200).json({
    status: true,
    message: "Total customers in the store fetched successfully.",
    totalCustomers: uniqueUsers.length,
    currentPage: parseInt(page),
    totalPages: Math.ceil(uniqueUsers.length / limit),
    data: {
      customers: paginatedUsers,
    },
  });
});

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
