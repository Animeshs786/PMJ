const mongoose = require("mongoose");
const CollectionAgent = require("../../../models/collectionAgent");
const StoreAssign = require("../../../models/storeAssign");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const pagination = require("../../../utils/pagination");

exports.getAllCollectionAgents = catchAsync(async (req, res, next) => {
  const {
    search,
    location,
    storeIds,
    dateFilter,
    startDate,
    endDate,
    page: currentPage,
    limit: currentLimit,
  } = req.body;

  let filter = {};

  // Search by name, mobile, or agentId
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { agentId: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by location
  if (location) {
    if (!mongoose.Types.ObjectId.isValid(location)) {
      return next(new AppError("Invalid location ID format", 400));
    }
    filter.location = location;
  }

  // Filter by storeIds if provided and non-empty
  if (storeIds?.length) {
    // Convert storeIds to array if passed as comma-separated string
    const storeIdsArray = Array.isArray(storeIds)
      ? storeIds
      : storeIds.split(",").map((id) => id.trim());

    // Validate storeIds format
    if (!storeIdsArray.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return next(new AppError("Invalid store ID format", 400));
    }

    // Build store assignment filter
    let storeAssignFilter = { store: { $in: storeIdsArray } };

    // Apply date filter to StoreAssign if provided
    if (dateFilter) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      let start = new Date();
      let end = new Date();

      switch (dateFilter.toUpperCase()) {
        case "QTD":
          if ([1, 2, 3].includes(currentMonth)) {
            start = new Date(currentYear, 0, 1);
            end = new Date(currentYear, 2, 31);
          } else if ([4, 5, 6].includes(currentMonth)) {
            start = new Date(currentYear, 3, 1);
            end = new Date(currentYear, 5, 30);
          } else if ([7, 8, 9].includes(currentMonth)) {
            start = new Date(currentYear, 6, 1);
            end = new Date(currentYear, 8, 30);
          } else {
            start = new Date(currentYear, 9, 1);
            end = new Date(currentYear, 11, 31);
          }
          break;

        case "MTD":
          start = new Date(currentYear, currentMonth - 1, 1);
          end = new Date(currentYear, currentMonth - 1, now.getDate());
          break;

        case "YTD":
          start = new Date(
            currentMonth >= 4 ? currentYear : currentYear - 1,
            3,
            1
          );
          end = new Date(currentYear, 2, 31);
          break;

        case "CUSTOM":
          if (!startDate) {
            return next(
              new AppError("startDate is required for CUSTOM date filter", 400)
            );
          }
          start = new Date(startDate);
          end = endDate ? new Date(endDate) : new Date();
          break;

        default:
          return next(new AppError("Invalid date filter", 400));
      }

      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(23, 59, 59, 999);
      storeAssignFilter.createdAt = { $gte: start, $lte: end };
    }

    // Find store assignments for the given store IDs
    const storeAssignments = await StoreAssign.find(storeAssignFilter).lean();
    if (!storeAssignments || storeAssignments.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No collection agents found for these store IDs",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage) || 1,
        results: 0,
        data: { collectionAgents: [] },
      });
    }

    // Extract unique collection agent IDs
    const collectionAgentIds = [
      ...new Set(
        storeAssignments
          .filter(
            (assignment) =>
              assignment.collectionAgent &&
              Array.isArray(assignment.collectionAgent)
          )
          .flatMap((assignment) =>
            assignment.collectionAgent.map((agent) => agent.toString())
          )
      ),
    ];

    if (!collectionAgentIds.length) {
      return res.status(200).json({
        status: true,
        message: "No collection agents found for these store IDs",
        totalResult: 0,
        totalPage: 0,
        currentPage: parseInt(currentPage) || 1,
        results: 0,
        data: { collectionAgents: [] },
      });
    }

    filter._id = { $in: collectionAgentIds };
  }

  // Apply date filter to CollectionAgent if no storeIds provided
  if (!storeIds?.length && dateFilter) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    let start = new Date();
    let end = new Date();

    switch (dateFilter.toUpperCase()) {
      case "QTD":
        if ([1, 2, 3].includes(currentMonth)) {
          start = new Date(currentYear, 0, 1);
          end = new Date(currentYear, 2, 31);
        } else if ([4, 5, 6].includes(currentMonth)) {
          start = new Date(currentYear, 3, 1);
          end = new Date(currentYear, 5, 30);
        } else if ([7, 8, 9].includes(currentMonth)) {
          start = new Date(currentYear, 6, 1);
          end = new Date(currentYear, 8, 30);
        } else {
          start = new Date(currentYear, 9, 1);
          end = new Date(currentYear, 11, 31);
        }
        break;

      case "MTD":
        start = new Date(currentYear, currentMonth - 1, 1);
        end = new Date(currentYear, currentMonth - 1, now.getDate());
        break;

      case "YTD":
        start = new Date(
          currentMonth >= 4 ? currentYear : currentYear - 1,
          3,
          1
        );
        end = new Date(currentYear, 2, 31);
        break;

      case "CUSTOM":
        if (!startDate) {
          return next(
            new AppError("startDate is required for CUSTOM date filter", 400)
          );
        }
        start = new Date(startDate);
        end = endDate ? new Date(endDate) : new Date();
        break;

      default:
        return next(new AppError("Invalid date filter", 400));
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }

  // Apply pagination
  const { limit, skip, totalResult, totalPage } = await pagination(
    currentPage,
    currentLimit,
    CollectionAgent,
    null,
    filter
  );

  // Fetch collection agents
  const collectionAgents = await CollectionAgent.find(filter)
    .skip(skip)
    .limit(limit)
    .sort("-createdAt")
    .populate("location", "name state")
    .lean();

  res.status(200).json({
    status: true,
    totalResult,
    totalPage,
    currentPage: parseInt(currentPage) || 1,
    results: collectionAgents.length,
    data: {
      collectionAgents,
    },
  });
});
