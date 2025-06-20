const Role = require("../../../models/role");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Permission = require("../../../models/permission");

exports.createRole = catchAsync(async (req, res, next) => {
  const { name, ...permission } = req.body;


    if (!name) {
      return next(new AppError("Role name is required", 400));
    }

    let newRole = await Role.findOne({ name });

    if (newRole) {
      return next(new AppError("Role already exists", 400));
    }

    const permissionData = await Permission.create(permission);

    newRole = await Role.create({
      name,
      permission: permissionData._id,
    });

    res.status(201).json({
      status: true,
      message: "Role created successfully",
      data: {
        role: newRole,
      },
    });
});
