const Plan = require("../../../models/plan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getPlanById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const plan = await Plan.findById(id);
  
    if (!plan) {
      return next(new AppError("No plan found with that ID", 404));
    }
  
    res.status(200).json({
      status: true,
      data: {
        plan,
      },
    });
  });