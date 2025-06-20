  const GoldAlert = require("../../../models/goldAlert");
  const AppError = require("../../../utils/AppError");
  const catchAsync = require("../../../utils/catchAsync");

  exports.createGoldAlert = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const { alertAmount, goldRate } = req.body;

    if (!alertAmount) {
      return next(new AppError("Please provide the amount", 400));
    }

    if (!goldRate) {
      return next(new AppError("Please provide the gold rate", 400));
    }

    let setAlert = await GoldAlert.findOne({ user: userId, goldRate });

    if (setAlert) {
      setAlert.alertAmount = alertAmount;
      setAlert.alertStatus = "Active";
      await setAlert.save();
    } else {
      setAlert = new GoldAlert({
        user: userId,
        alertAmount,
        goldRate,
      });
      await setAlert.save();
    }
    res.status(200).json({
      status: true,
      message: "Gold alert set successfully",
      data: {
        setAlert,
      },
    });
  });
