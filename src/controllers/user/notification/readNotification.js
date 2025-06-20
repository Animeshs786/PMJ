const Notification = require("../../../models/notification");
const catchAsync = require("../../../utils/catchAsync");

exports.readNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    return res.status(404).json({
      status: false,
      message: "Notification not found",
    });
  }

  // Check if user has already read the notification
  if (!notification.readBy.includes(userId)) {
    await Notification.findByIdAndUpdate(notificationId, {
      $addToSet: { readBy: userId }, // Prevents duplicates
    });
  }

  res.status(200).json({
    status: true,
    message: "Notification marked as read",
    data: {
      notificationId,
    },
  });
});
