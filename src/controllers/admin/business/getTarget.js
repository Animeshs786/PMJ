const Target = require("../../../models/target");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getTargetById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const target = await Target.findById(id).populate("salePerson");
  
    if (!target) {
      return next(new AppError("No target found with that id", 404));
    }
  
    res.status(200).json({
      status: true,
      message: "Target fetched successfully",
      data: target,
    });
  });