const Role = require("../../../models/role");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Permission = require("../../../models/permission");

exports.deleteRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const deletedRole = await Role.findById(id);

  if (!deletedRole) {
    return next(new AppError("Role not found", 404));
  }

  await Permission.findByIdAndDelete(deletedRole.permission);
  await Role.findByIdAndDelete(id);

  res.status(200).json({
    status: true,
    message: "Role deleted successfully",
  });
});
