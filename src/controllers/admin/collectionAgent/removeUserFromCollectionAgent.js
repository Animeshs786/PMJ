const UserAssign = require("../../../models/userAssign");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.removeUserFromCollectionAgent = catchAsync(async (req, res, next) => {
  const { user, collectionAgent } = req.body;

  // Find and delete the assignment
  const deletedAssignment = await UserAssign.findOneAndDelete({
    user,
    collectionAgent,
  });

  if (!deletedAssignment) {
    return next(new AppError("User assignment not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "User assignment removed successfully.",
    data: deletedAssignment,
  });
});
