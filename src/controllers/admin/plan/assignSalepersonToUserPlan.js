const mongoose = require("mongoose");
const UserPlan = require("../../../models/userPlan");
const SalePerson = require("../../../models/salePerson"); // Assuming this is the model for salePersonSchema
const catchAsync = require("../../../utils/catchAsync");

exports.assignSalePersonToUserPlan = catchAsync(async (req, res) => {
  const { userPlanId, salePersonId } = req.body;

  // Validate required fields
  if (!userPlanId || !salePersonId) {
    return res.status(400).json({
      status: false,
      message: "userPlanId and salePersonId are required",
    });
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userPlanId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid userPlanId format",
    });
  }

  // Check if user plan exists
  const userPlan = await UserPlan.findById(userPlanId);
  if (!userPlan) {
    return res.status(404).json({
      status: false,
      message: "User plan not found",
    });
  }

  // Check if salesperson exists
  const salePerson = await SalePerson.findOne({ userId: salePersonId });
  if (!salePerson) {
    return res.status(404).json({
      status: false,
      message: "Salesperson not found",
    });
  }

  // Update the salePersonId in user plan
  userPlan.salePersonId = salePersonId;
  await userPlan.save();

  // Fetch the updated user plan with populated fields for response
  const updatedUserPlan = await UserPlan.findById(userPlanId)
    .populate("user", "name email mobile")
    .populate("plan", "name");

  res.status(200).json({
    status: true,
    message: "Salesperson assigned successfully",
    data: {
      userPlan: updatedUserPlan,
    },
  });
});