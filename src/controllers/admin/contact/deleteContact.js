const Contact = require("../../../models/contact");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.deleteContact = catchAsync(async (req, res, next) => {
  const goldExchange = await Contact.findByIdAndDelete(req.params.id);

  if (!goldExchange) {
    return next(new AppError("No Contact request found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    message: "Contact request deleted successfully",
  });
});
