const SalePerson = require("../../../models/salePerson");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateSalePerson = catchAsync(async (req, res, next) => {
  const { name, email, mobile, userId,status } = req.body;

  if (!name) return next(new AppError("Please provide name", 400));
  if (!email) return next(new AppError("Please provide email", 400));
  if (!mobile) return next(new AppError("Please provide mobile", 400));
  if (!userId) return next(new AppError("Please provide userId", 400));

  const existingUser = await SalePerson.findOne({
    _id: { $ne: req.params.id },
    $or: [{ email }, { mobile }, { userId }],
  });

  if (existingUser) {
    return res.status(400).json({
      status: "fail",
      message:
        "Email, mobile, or userId already exists. Please use unique values.",
    });
  }

  const updatedUser = await SalePerson.findByIdAndUpdate(
    req.params.id,
    { name, email, mobile, userId ,status},
    { new: true, runValidators: true }
  );

  if (!updatedUser)
    return next(new AppError("No sale person found with that ID", 404));

  res.status(200).json({ status: "success", data: updatedUser });
});
