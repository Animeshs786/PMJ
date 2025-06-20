const Transaction = require("../../../models/transaction");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateTransaction = catchAsync(async (req, res, next) => {
  const { remark } = req.body;
  const filterObj = {};

  if (remark) filterObj.remark = remark;

  const transaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    filterObj,
    { new: true, runValidators: true }
  );

  if (!transaction) {
    return next(
      new AppError("No transaction  request found with that ID", 404)
    );
  }

  res.status(200).json({
    status: true,
    message: "Remark addd successfully.",
    data: {
      service: transaction,
    },
  });
});
