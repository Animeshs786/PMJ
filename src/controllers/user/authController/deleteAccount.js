const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteAccount = catchAsync(async (req, res) => {
  const userId = req.user._id;
  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: true,
    message: "Account deleted successfully",
  });
});
