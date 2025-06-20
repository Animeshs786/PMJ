const Service = require("../../../models/service");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.updateService = catchAsync(async (req, res, next) => {
  const { name, mobileNumber, email, message, status } = req.body;
  const filterObj = {};

  if (name) filterObj.name = name;
  if (mobileNumber) filterObj.mobileNumber = mobileNumber;
  if (email) filterObj.email = email;
  if (message) filterObj.message = message;
  if (status) {
    filterObj.status = status;
    filterObj.updatedAt = new Date();
  }

  const updatedGoldExchange = await Service.findByIdAndUpdate(
    req.params.id,
    filterObj,
    { new: true, runValidators: true }
  );

  if (!updatedGoldExchange) {
    return next(
      new AppError("No service  request found with that ID", 404)
    );
  }

  res.status(200).json({
    status: true,
    message: "Service request updated successfully",
    data: {
      service: updatedGoldExchange,
    },
  });
});
