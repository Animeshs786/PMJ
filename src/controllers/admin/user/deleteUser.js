const User = require("../../../models/user");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  return res.status(200).json({
    status: true,
    message: "User deleted successfully.",
  });
});
