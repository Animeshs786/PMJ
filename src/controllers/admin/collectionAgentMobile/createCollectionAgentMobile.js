const CollectionAgentMobile = require("../../../models/collectionAgentMobile");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const createCollectionAgentMobile = catchAsync(async (req, res, next) => {
  const { mobile } = req.body;

  // Check if mobile already exists
  const existingMobile = await CollectionAgentMobile.findOne({ mobile });
  if (existingMobile) {
    return next(new AppError("Mobile number already exists.", 400));
  }

  const collectionAgentMobile = await CollectionAgentMobile.create({ mobile });

  res.status(201).json({
    status: true,
    message: "Collection agent mobile created successfully.",
    data: collectionAgentMobile,
  });
});

module.exports = createCollectionAgentMobile;