// const Notification = require("../../../models/notification");
// const User = require("../../../models/user");
// const catchAsync = require("../../../utils/catchAsync");
// const admin = require("../../../firebase/firebase");

// exports.createNotification = catchAsync(async (req, res) => {
//   let file;
//   const { title, message, userId, type } = req.body;

//   const allowedTypes = [
//     "birthday",
//     "goldAlert",
//     "aniversary",
//     "seasonal",
//     "exhibition",
//     "other"
//   ];
//   if (!allowedTypes.includes(type)) {
//     return res.status(400).json({
//       status: false,
//       message: `Invalid type. Allowed values are: ${allowedTypes.join(", ")}`,
//     });
//   }

//   // Handle uploaded file if available
//   if (req.files && req.files.file) {
//     file = `${req.files.file[0].destination}/${req.files.file[0].filename}`;
//   }

//   // Create notification in the database
//   const newNotification = await Notification.create({
//     title: title || "", // Default value handled by schema
//     message: message || " ", // Default value handled by schema
//     userId: userId || null,
//     type,
//     file: file || "", // Default value handled by schema
//   });

//   // Function to send FCM notification
//   const sendFCMNotification = async (userId, title, message, file, type) => {
//     const user = await User.findById(userId);
//     if (!user || !user.fcmToken) return;

//     const payload = {
//       notification: {
//         title: title,
//         body: message,
//         image: "http://167.71.232.245:5555/" + file,
//       },
//       data: {
//         type: type,
//       },
//       token: user.fcmToken, // Use the FCM token directly
//     };

//     try {
//       const test = await admin.messaging().send(payload); // Use the correct method `send`
//       console.log(test, "test");
//       console.log(`Notification sent via FCM to user ${userId}`);
//     } catch (error) {
//       console.error("Error sending FCM notification:", error);
//     }
//   };

//   // Send FCM to specific user or all users if userId is null
//   if (userId) {
//     await sendFCMNotification(userId, title, message, file, type);
//   } else {
//     const users = await User.find({ fcmToken: { $exists: true, $ne: null } });
//     for (const user of users) {
//       await sendFCMNotification(user._id, title, message, file, type);
//     }
//   }

//   // Send response
//   res.status(201).json({
//     status: true,
//     message: "Notification created and sent successfully",
//     data: {
//       notification: newNotification,
//     },
//   });
// });


const Notification = require("../../../models/notification");
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const admin = require("../../../firebase/firebase");
const mongoose = require("mongoose");

exports.createNotification = catchAsync(async (req, res) => {
  let file;
  const { title, message, userId, type } = req.body;
  console.log("Received userId (raw):", userId, typeof userId);

  const allowedTypes = [
    "birthday",
    "goldAlert",
    "aniversary",
    "seasonal",
    "exhibition",
    "other",
  ];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({
      status: false,
      message: `Invalid type. Allowed values are: ${allowedTypes.join(", ")}`,
    });
  }

  // Validate and normalize userId array
  let userIds = [];
  if (userId) {
    try {
      // Handle stringified array case
      if (typeof userId === "string") {
        console.log("userId is a string, attempting to parse:", userId);
        const parsed = JSON.parse(userId);
        userIds = Array.isArray(parsed) ? parsed : [parsed];
      } else if (Array.isArray(userId)) {
        userIds = userId;
      } else {
        userIds = [userId]; // Single ID for backward compatibility
      }

      console.log("Normalized userIds:", userIds);

      // Validate each userId
      const invalidIds = userIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        console.log("Invalid user IDs:", invalidIds);
        return res.status(400).json({
          status: false,
          message: `Invalid user IDs: ${invalidIds.join(", ")}`,
        });
      }

      // Verify user existence
      const users = await User.find({ _id: { $in: userIds } }).select("_id");
      const foundUserIds = users.map(user => user._id.toString());
      const missingIds = userIds.filter(id => !foundUserIds.includes(id));
      if (missingIds.length > 0) {
        console.log("Non-existent user IDs:", missingIds);
        return res.status(400).json({
          status: false,
          message: `User IDs not found: ${missingIds.join(", ")}`,
        });
      }
    } catch (error) {
      console.error("Error parsing userId:", error);
      return res.status(400).json({
        status: false,
        message: "Invalid userId format. Expected an array or valid JSON string.",
      });
    }
  }

  // Handle uploaded file if available
  if (req.files && req.files.file) {
    file = `${req.files.file[0].destination}/${req.files.file[0].filename}`;
  }

  // Function to send FCM notification
  const sendFCMNotification = async (userId, title, message, file, type) => {
    try {
      const user = await User.findById(userId).select("fcmToken");
      if (!user || !user.fcmToken) {
        console.log(`No FCM token for user ${userId}`);
        return;
      }

      const payload = {
        notification: {
          title,
          body: message,
          image: file ? `http://167.71.232.245:5555/${file}` : undefined,
        },
        data: {
          type,
        },
        token: user.fcmToken,
      };

      await admin.messaging().send(payload);
      console.log(`Notification sent via FCM to user ${userId}`);
    } catch (error) {
      console.error(`Error sending FCM notification to user ${userId}:`, error);
    }
  };

  // Create notifications and send FCM
  let notifications = [];
  if (userIds.length > 0) {
    // Create a notification for each userId
    notifications = await Promise.all(
      userIds.map(async (id) => {
        const newNotification = await Notification.create({
          userId: id,
          title: title || "",
          message: message || " ",
          type,
          file: file || "",
        });

        // Send FCM notification to the user
        await sendFCMNotification(id, title || "", message || " ", file, type);

        return newNotification;
      })
    );
  } else {
    // Send to all users if no userId is provided
    const users = await User.find({ fcmToken: { $exists: true, $ne: null } }).select("_id");
    console.log(`Sending to ${users.length} users with FCM tokens`);
    notifications = await Promise.all(
      users.map(async (user) => {
        const newNotification = await Notification.create({
          userId: user._id,
          title: title || "",
          message: message || " ",
          type,
          file: file || "",
        });

        // Send FCM notification to the user
        await sendFCMNotification(user._id, title || "", message || " ", file, type);

        return newNotification;
      })
    );
  }

  // Send response
  res.status(200).json({
    status: true,
    message: "Notifications created successfully",
    data: notifications,
  });
});