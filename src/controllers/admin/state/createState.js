const State = require("../../../models/state");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const createState = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const existingState = await State.findOne({ name });
  if (existingState) {
    return next(new AppError("State already exist.", 400));
  }

  const state = await State.create({ name });

  res.status(201).json({
    status: true,
    message: "State created successfully.",
    data: state,
  });
});

module.exports = createState;
