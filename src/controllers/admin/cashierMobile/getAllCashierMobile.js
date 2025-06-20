const CashierMobile = require("../../../models/cashierMobile");
const catchAsync = require("../../../utils/catchAsync");

const getAllCashierMobiles = catchAsync(async (req, res) => {
  const collectionAgentMobiles = await CashierMobile.find();

  res.status(200).json({
    status: true,
    message: "Cashier agent mobiles fetched successfully.",
    data: collectionAgentMobiles,
  });
});

module.exports = getAllCashierMobiles;
