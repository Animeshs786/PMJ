const Visit = require("../../../models/visit");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getVisit = catchAsync(async (req, res, next) => {
  const goldExchange = await Visit.findById(req.params.id);

  if (!goldExchange) {
    return next(
      new AppError("No visit  request found with that ID", 404)
    );
  }

  res.status(200).json({
    status: true,
    data: {
      visit:goldExchange,
    },
  });
});
