const Target = require("../../../models/target");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllTargets = catchAsync(async (req, res, next) => {
  const { salePerson } = req.query;
  if (!salePerson) return next(new AppError("Please provide salePerson", 400));

  const targets = await Target.find({
    salePerson: salePerson,
  }).sort("month");

  res.status(200).json({
    status: true,
    message: "Targets fetched successfully",
    data: targets,
  });
});
