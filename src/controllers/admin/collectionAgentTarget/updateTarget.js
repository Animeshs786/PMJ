const CollectionAgent = require("../../../models/collectionAgent");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateCollectionTarget = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { target } = req.body;

  const updatedTarget = await CollectionAgent.findByIdAndUpdate(
    id,
    { target },
    { new: true, runValidators: true }
  );

  if (!updatedTarget) {
    return next(new AppError("Target not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Target updated successfully",
    data: updatedTarget,
  });
});
