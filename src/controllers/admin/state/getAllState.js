const State = require("../../../models/state");
const catchAsync = require("../../../utils/catchAsync");

const getAllStates = catchAsync(async (req, res, next) => {
  const {
    search = "",
    page: currentPage = 1,
    limit: currentLimit = 10,
  } = req.query;

  const query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" }; 
  }

  // Pagination logic
  const limit = Math.max(1, parseInt(currentLimit));
  const page = Math.max(1, parseInt(currentPage));
  const skip = (page - 1) * limit;

  // Fetch total count for pagination metadata
  const totalResult = await State.countDocuments(query);
  const totalPage = Math.ceil(totalResult / limit);

  // Fetch states with search and pagination
  const states = await State.find(query)
    .sort({ name: 1 }) 
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: true,
    message: "States fetched successfully.",
    totalResult,
    totalPage,
    currentPage: page,
    results: states.length,
    data: states,
  });
});

module.exports = getAllStates;