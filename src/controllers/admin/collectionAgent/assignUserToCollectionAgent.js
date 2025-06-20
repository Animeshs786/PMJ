const mongoose = require("mongoose");
const UserAssign = require("../../../models/userAssign");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.assignUserToCollectionAgent = catchAsync(async (req, res, next) => {
  const { user, collectionAgent } = req.body;

  // Validate input
  if (!user || !collectionAgent) {
    return next(new AppError("User and collectionAgent IDs are required", 400));
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(collectionAgent)) {
    return next(new AppError("Invalid user or collectionAgent ID format", 400));
  }

  // Check if the user is already assigned to any collection agent
  const existingAssignment = await UserAssign.findOne({ user });

  if (existingAssignment) {
    return next(
      new AppError("User is already assigned to a collection agent", 400)
    );
  }

  // Create new assignment
  const newAssignment = await UserAssign.create({ user, collectionAgent });

  res.status(201).json({
    status: true,
    message: "User assigned to collection agent successfully",
    data: newAssignment,
  });
});