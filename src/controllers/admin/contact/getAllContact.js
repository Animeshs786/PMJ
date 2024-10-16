const Contact = require("../../../models/contact");
const catchAsync = require("../../../utils/catchAsync");
const pagination = require("../../../utils/pagination");

exports.getAllContact = catchAsync(async (req, res) => {
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
    Contact,
    null,
    filter
  );
  const goldExchanges = await Contact.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt");

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: currentPage ? parseInt(currentPage) : 1,
    results: goldExchanges.length,
    data: {
      contact: goldExchanges,
    },
  });
});