const CashierMobile = require("../../../models/cashierMobile");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const getCashierMobileById = catchAsync(async (req, res, next) => {
  const collectionAgentMobileId = req.params.id;

  const collectionAgentMobile = await CashierMobile.findById(
    collectionAgentMobileId
  );
  if (!collectionAgentMobile) {
    return next(new AppError("Cashier agent mobile not found.", 404));
  }

  res.status(200).json({
    status: true,
    message: "Cashier agent mobile fetched successfully.",
    data: collectionAgentMobile,
  });
});

module.exports = getCashierMobileById;
