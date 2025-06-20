const Contest = require("../../../models/contest");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");

exports.getAllCoontest = catchAsync(async (req, res) => {
  const {
    search,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
    isActive,
  } = req.query;

  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (isActive) {
    filter.isActive = isActive;
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
    Contest,
    null,
    filter
  );
  const exhibitions = await Contest.find(filter).skip(skip).limit(limit);
  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    message: "Contests fetched successfully",
    data: exhibitions,
  });
});
