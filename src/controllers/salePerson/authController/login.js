const SalePerson = require("../../../models/salePerson");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");

exports.login = catchAsync(async (req, res, next) => {
  const { userId, password } = req.body;
  if (!userId || !password)
    return next(new AppError("User id and password are required.", 404));

  const user = await SalePerson.findOne({ userId }).select("+password");

  if (!user || !(await user.comparePassword(password)))
    return next(new AppError("Invalid userId or password.", 404));

  user.password = undefined;
  createToken(user, 200, res);
});
