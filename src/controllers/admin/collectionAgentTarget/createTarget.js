// Update the path to your Target model
const CollectionAgentTarget = require("../../../models/collectionAgentTarget");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createCollectionTarget = catchAsync(async (req, res, next) => {
  const { collectionAgent, target, month } = req.body;

  if (!collectionAgent)
    return next(new AppError("Please provide collectionAgent", 400));
  if (!target) return next(new AppError("Please provide target", 400));

  const existingTarget = await CollectionAgentTarget.findOne({
    collectionAgent,
    month,
  });

  if (existingTarget) {
    return next(
      new AppError(
        "Target for this collection agent and month already exists.",
        400
      )
    );
  }

  const newTarget = await CollectionAgentTarget.create({
    collectionAgent,
    target,
    month,
  });

  res.status(201).json({
    status: true,
    message: "Target created successfully",
    data: newTarget,
  });
});
