const Target = require("../../../models/target"); // Update the path to your Target model
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createTarget = catchAsync(async (req, res, next) => {
  const { salePerson, target, month } = req.body;

  if (!salePerson) return next(new AppError("Please provide salePerson", 400));
  if (!target) return next(new AppError("Please provide target", 400));

  const existingTarget = await Target.findOne({ salePerson, month });

  if (existingTarget) {
    return next(
      new AppError("Target for this salesperson and month already exists.", 400)
    );
  }

  const newTarget = await Target.create({ salePerson, target, month });

  res.status(201).json({
    status: true,
    message: "Target created successfully",
    data: newTarget,
    salePerson
  });
});
