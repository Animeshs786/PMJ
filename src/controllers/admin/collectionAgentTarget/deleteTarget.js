
const CollectionAgentTarget = require("../../../models/collectionAgentTarget");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteCollectionTarget = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedTarget = await CollectionAgentTarget.findByIdAndDelete(id);

  if (!deletedTarget) {
    return next(new AppError("No target found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Target deleted successfully",
  });
});
