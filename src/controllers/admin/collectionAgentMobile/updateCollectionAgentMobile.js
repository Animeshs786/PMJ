const CollectionAgentMobile = require("../../../models/collectionAgentMobile");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const updateCollectionAgentMobile = catchAsync(async (req, res, next) => {
  const collectionAgentMobileId = req.params.id;
  const { mobile } = req.body;

  // Check if mobile already exists
  const existingMobile = await CollectionAgentMobile.findOne({ mobile });
  if (existingMobile && existingMobile._id.toString() !== collectionAgentMobileId) {
    return next(new AppError("Mobile number already exists.", 400));
  }

  const collectionAgentMobile = await CollectionAgentMobile.findByIdAndUpdate(
    collectionAgentMobileId,
    { mobile },
    { new: true, runValidators: true }
  );

  if (!collectionAgentMobile) {
    return next(new AppError("Collection agent mobile not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "Collection agent mobile updated successfully.",
    data: collectionAgentMobile,
  });
});

module.exports = updateCollectionAgentMobile;