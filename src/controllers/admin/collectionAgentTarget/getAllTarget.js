const CollectionAgentTarget = require("../../../models/collectionAgentTarget");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllCollectionTargets = catchAsync(async (req, res, next) => {
  const { collectionAgent } = req.query;
  if (!collectionAgent)
    return next(new AppError("Please provide collectionAgent", 400));

  const targets = await CollectionAgentTarget.find({
    collectionAgent: collectionAgent,
  }).sort("month");

  res.status(200).json({
    status: true,
    message: "Targets fetched successfully",
    data: targets,
  });
});
