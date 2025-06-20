const Notification = require("../../../models/notification");
const catchAsync = require("../../../utils/catchAsync");

exports.notificationCount = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const userCreatedAt = req.user.createdAt;

  const notificationCount = await Notification.countDocuments({
    $or: [{ userId: userId }, { userId: null }],
    readBy: { $ne: userId },
     createdAt: { $gt: userCreatedAt } ,
  });

  res.status(200).json({
    status: true,
    message: "Notification count retrieved successfully",
    data: {
      notificationCount,
    },
  });
});
