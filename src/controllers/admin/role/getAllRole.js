const Role = require("../../../models/role");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllRoles = catchAsync(async (req, res) => {
  const roles = await Role.find();
  res.status(200).json({
    status: true,
    data: roles,
  });
});
