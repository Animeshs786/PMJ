const CollectionAgent = require("../../../models/collectionAgent");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateCollectionAgent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, mobile, location } = req.body;

  // Find the CollectionAgent
  const collectionAgent = await CollectionAgent.findById(id);
  if (!collectionAgent) {
    return next(new AppError("Collection agent not found.", 404));
  }

  // Trim and validate mobile number
  const trimmedMobile = String(mobile).trim();
  if (
    isNaN(trimmedMobile) ||
    trimmedMobile.includes("e") ||
    trimmedMobile.includes(".") ||
    trimmedMobile.length > 10
  ) {
    return next(new AppError("Invalid mobile number.", 400));
  }

  // Check for duplicates (email, mobile)
  const existingAgentByMobile = await CollectionAgent.findOne({
    _id: { $ne: id }, // Exclude the current CollectionAgent
    mobile: trimmedMobile,
  });
  const existingAgentByEmail = await CollectionAgent.findOne({
    _id: { $ne: id }, // Exclude the current CollectionAgent
    email,
  });

  if (existingAgentByMobile) {
    return next(
      new AppError(
        "Collection agent with this mobile number already exists.",
        400
      )
    );
  }

  if (existingAgentByEmail) {
    return next(
      new AppError("Collection agent with this email already exists.", 400)
    );
  }

  // Update fields
  if (name) collectionAgent.name = name;
  if (email) collectionAgent.email = email;
  if (mobile) collectionAgent.mobile = trimmedMobile;
  if (location) collectionAgent.location = location;

  await collectionAgent.save();

  res.status(200).json({
    status: true,
    message: "Collection agent updated successfully.",
    data: {
      collectionAgent,
    },
  });
});
