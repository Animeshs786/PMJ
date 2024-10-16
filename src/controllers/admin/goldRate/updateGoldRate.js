const GoldRate = require("../../../models/goldRate");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateGoldRate = catchAsync(async (req, res, next) => {
  const { goldRate, carret, currencyType } = req.body;
  const updateObj = {
    lastUpdateAt: Date.now(),
  };
  if (goldRate) updateObj.goldRate = goldRate;
  if (carret) updateObj.carret = carret;
  if (currencyType) updateObj.currencyType = currencyType;

  const updatedGoldRate = await GoldRate.findByIdAndUpdate(
    req.params.id,
    updateObj,
    { new: true, runValidators: true }
  );

  if (!updatedGoldRate) {
    return next(new AppError("No gold rate found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Gold rate updated successfully",
    data: {
      updatedGoldRate,
    },
  });
});
