const SalePerson = require("../../../models/salePerson");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const createToken = require("../../../utils/createToken");

exports.register = catchAsync(async (req, res, next) => {
  const { name, password, email, mobile, userId } = req.body;

  if (!name) return next(new AppError("Please provide name", 400));
  if (!password) return next(new AppError("Please provide password", 400));
  if (!email) return next(new AppError("Please provide email", 400));
  if (!mobile) return next(new AppError("Please provide mobile", 400));
  if (!userId) return next(new AppError("Please provide userId", 400));

  const existingUser = await SalePerson.findOne({
    $or: [{ email }, { mobile }, { userId }],
  });

  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message:
        "Email, mobile, or userId already exists. Please use unique values.",
    });
  }

  const obj = { name, password, email, mobile, userId, role: "salePerson" };

  const newUser = await SalePerson.create(obj);
  newUser.password = undefined;

  // Send token in the response
  createToken(newUser, 201, res);
});
