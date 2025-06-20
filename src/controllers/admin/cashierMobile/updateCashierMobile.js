const CashierMobile = require("../../../models/cashierMobile");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const updateCashierMobile = catchAsync(async (req, res, next) => {
  const collectionAgentMobileId = req.params.id;
  const { mobile } = req.body;

  // Check if mobile already exists
  const existingMobile = await CashierMobile.findOne({ mobile });
  if (
    existingMobile &&
    existingMobile._id.toString() !== collectionAgentMobileId
  ) {
    return next(new AppError("Mobile number already exists.", 400));
  }

  const collectionAgentMobile = await CashierMobile.findByIdAndUpdate(
    collectionAgentMobileId,
    { mobile },
    { new: true, runValidators: true }
  );

  if (!collectionAgentMobile) {
    return next(new AppError("Cashier agent mobile not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "Cashier agent mobile updated successfully.",
    data: collectionAgentMobile,
  });
});

module.exports = updateCashierMobile;
