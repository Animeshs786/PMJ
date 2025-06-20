const CollectionAgentTarget = require("../../../models/collectionAgentTarget");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getCollectionTargetById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const target = await CollectionAgentTarget.findById(id).populate(
    "collectionAgent"
  );

  if (!target) {
    return next(new AppError("No target found with that id", 404));
  }

  res.status(200).json({
    status: true,
    message: "Target fetched successfully",
    data: target,
  });
});
