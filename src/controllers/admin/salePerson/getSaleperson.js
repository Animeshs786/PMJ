const SalePerson = require("../../../models/salePerson");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getSalePerson = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const salePerson = await SalePerson.findById(id);
  if (!salePerson) {
    return next(new AppError("SalePerson not found.", 404));
  }

  res.status(200).json({
    status: true,
    data: {
      salePerson,
    },
  });
});
