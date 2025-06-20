const Role = require("../../../models/role");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Permission = require("../../../models/permission");

exports.updateRole = catchAsync(async (req, res, next) => {
  const { id:roleId } = req.params;
  const { name, ...permission } = req.body;

  if (!roleId) {
    return next(new AppError("Role ID is required", 400));
  }

  let existingRole = await Role.findById(roleId).populate("permission");

  if (!existingRole) {
    return next(new AppError("Role not found", 404));
  }

  if (name && name !== existingRole.name) {
    const duplicateRole = await Role.findOne({ name });
    if (duplicateRole) {
      return next(new AppError("Role name already exists", 400));
    }
  }

  if (Object.keys(permission).length > 0) {
    if (existingRole.permission) {
      await Permission.findByIdAndUpdate(existingRole.permission._id, permission);
    } else {
      const newPermission = await Permission.create(permission);
      existingRole.permission = newPermission._id;
    }
  }

  if (name) {
    existingRole.name = name;
  }

  await existingRole.save();

  res.status(200).json({
    status: true,
    message: "Role updated successfully",
    data: {
      role: existingRole,
    },
  });
});
