const Notification = require("../../../models/notification");
const catchAsync = require("../../../utils/catchAsync");

exports.getNotifications = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const userCreatedAt = req.user.createdAt;

  const notifications = await Notification.find({
    $and: [
      { $or: [{ userId }, { userId: null }] },
      { createdAt: { $gt: userCreatedAt } },
    ],
  }).sort({ createdAt: -1 });

  const notificationsWithReadStatus = notifications.map((notification) => {
    return {
      ...notification.toObject(),
      isRead: notification.readBy.includes(userId),
    };
  });

  res.status(200).json({
    status: true,
    results: notificationsWithReadStatus.length,
    message: "Notifications retrieved successfully",
    data: {
      notifications: notificationsWithReadStatus,
    },
  });
});
