const Contact = require("../../../models/contact");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.getContact = catchAsync(async (req, res, next) => {
  const goldExchange = await Contact.findById(req.params.id);

  if (!goldExchange) {
    return next(new AppError("No contact  request found with that ID", 404));
  }

  res.status(200).json({
    status: true,
    data: {
      contact: goldExchange,
    },
  });
});
