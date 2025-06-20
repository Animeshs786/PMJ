const CashierMobile = require("../../../models/cashierMobile");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const createCashierMobile = catchAsync(async (req, res, next) => {
  const { mobile } = req.body;

  // Check if mobile already exists
  const existingMobile = await CashierMobile.findOne({ mobile });
  if (existingMobile) {
    return next(new AppError("Mobile number already exists.", 400));
  }

  const collectionAgentMobile = await CashierMobile.create({ mobile });

  res.status(201).json({
    status: true,
    message: "Cashier agent mobile created successfully.",
    data: collectionAgentMobile,
  });
});

module.exports = createCashierMobile;
