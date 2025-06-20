const CollectionAgent = require("../../../models/collectionAgent");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteCollectionAgent = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const collectionAgent = await CollectionAgent.findByIdAndDelete(id);
  if (!collectionAgent) {
    return next(new AppError("Collection agent not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "Collection agent deleted successfully.",
  });
});
