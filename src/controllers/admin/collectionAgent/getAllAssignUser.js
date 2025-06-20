const UserAssign = require("../../../models/userAssign");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllAssignUser = catchAsync(async (req, res) => {
  const { collectionAgentId, page = 1, limit = 10 } = req.query;

  if (!collectionAgentId) {
    return res
      .status(400)
      .json({ status: false, message: "collectionAgentId is required" });
  }

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;

  // Fetch assigned users with pagination
  const assignedUsers = await UserAssign.find({
    collectionAgent: collectionAgentId,
  })
    .populate("user", "name email phone")
    .skip(skip)
    .limit(pageSize)
    .exec();

  const totalCount = await UserAssign.countDocuments({
    collectionAgent: collectionAgentId,
  });

  res.status(200).json({
    status: true,
    message: "Assigned users fetched successfully",
    data: assignedUsers,
    pagination: {
      totalRecords: totalCount,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  });
});
