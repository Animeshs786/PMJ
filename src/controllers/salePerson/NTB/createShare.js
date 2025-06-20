const Share = require("../../../models/share");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createShare = catchAsync(async (req, res, next) => {
  const { name, mobile } = req.body;
  const salePerson = req.user._id;

  if (!mobile) return next(new AppError("Please provide mobile number", 400));

  const share = new Share({
    name,
    mobile,
    salePerson,
  });

  await share.save();

  res.status(201).json({
    status: true,
    message: "Share request created successfully",
    data: {
      visit: share,
    },
  });
});
