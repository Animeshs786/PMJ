const CollectionAgentMobile = require("../../../models/collectionAgentMobile");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const deleteCollectionAgentMobile = catchAsync(async (req, res, next) => {
  const collectionAgentMobileId = req.params.id;

  const collectionAgentMobile = await CollectionAgentMobile.findByIdAndDelete(
    collectionAgentMobileId
  );
  if (!collectionAgentMobile) {
    return next(new AppError("Collection agent mobile not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "Collection agent mobile deleted successfully.",
  });
});

module.exports = deleteCollectionAgentMobile;
