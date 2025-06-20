const Notification = require("../../../models/notification");
const catchAsync = require("../../../utils/catchAsync");

exports.markAllNotificationsAsRead = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const notifications = await Notification.updateMany(
    {
      $or: [{ userId: userId }, { userId: null }],
      readBy: { $ne: userId },
    },
    { $push: { readBy: userId } }
  );

  const io = req.app.locals.io;
  const users = req.app.locals.users;

  if (io) {
    const notificationCount = await Notification.countDocuments({
      $or: [{ userId: userId }, { userId: null }],
      readBy: { $ne: userId },
    });

    const socketId = users[userId];
    if (socketId) {
      io.to(socketId).emit("notificationCount", notificationCount);
    }
  }

  res.status(200).json({
    status: true,
    message: "All notifications marked as read",
    // data: {
    //   updatedCount: notifications.nModified,
    // },
  });
});
