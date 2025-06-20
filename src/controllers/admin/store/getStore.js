const Store = require("../../../models/store");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getStore = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const store = await Store.findById(id);

  if (!store) {
    return next(new AppError("No store found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    data: {
      store,
    },
  });
});
