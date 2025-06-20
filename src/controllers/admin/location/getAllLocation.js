const Location = require("../../../models/location");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const mongoose = require("mongoose");

const getAllLocations = catchAsync(async (req, res, next) => {
  const {
    search = "",
    state,
    page: currentPage = 1,
    limit: currentLimit = 10,
  } = req.query;

  // Build query with filters
  const query = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  if (state) {
    if (!mongoose.Types.ObjectId.isValid(state)) {
      return next(new AppError("Invalid state ID format", 400));
    }
    query.state = state;
  }

  // Pagination logic
  const limit = Math.max(1, parseInt(currentLimit));
  const page = Math.max(1, parseInt(currentPage));
  const skip = (page - 1) * limit;

  // Fetch total count for pagination metadata
  const totalResult = await Location.countDocuments(query);
  const totalPage = Math.ceil(totalResult / limit);

  // Fetch locations with search, state filter, and pagination
  const locations = await Location.find(query)
    .populate("state", "name")
    .sort({ name: 1 }) // Sort alphabetically by name
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: true,
    message: "Locations fetched successfully.",
    totalResult,
    totalPage,
    currentPage: page,
    results: locations.length,
    data: locations,
  });
});

module.exports = getAllLocations;