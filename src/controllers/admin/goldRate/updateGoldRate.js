// const GoldRate = require("../../../models/goldRate");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.updateGoldRate = catchAsync(async (req, res, next) => {
//   const { goldRate, carret, currencyType } = req.body;
//   const updateObj = {
//     lastUpdateAt: Date.now(),
//   };
//   if (goldRate) updateObj.goldRate = goldRate;
//   if (carret) updateObj.carret = carret;
//   if (currencyType) updateObj.currencyType = currencyType;

//   const updatedGoldRate = await GoldRate.findByIdAndUpdate(
//     req.params.id,
//     updateObj,
//     { new: true, runValidators: true }
//   );

//   if (!updatedGoldRate) {
//     return next(new AppError("No gold rate found with that ID", 404));
//   }

//   res.status(200).json({
//     status: true,
//     message: "Gold rate updated successfully",
//     data: {
//       updatedGoldRate,
//     },
//   });
// });

const GoldRate = require("../../../models/goldRate");
const GoldAlert = require("../../../models/goldAlert"); // Import the GoldAlert model
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const Notification = require("../../../models/notification"); // Import the Notification model (if needed)
const admin = require("../../../firebase/firebase"); // Import Firebase Admin SDK for FCM notifications

exports.updateGoldRate = catchAsync(async (req, res, next) => {
  const { goldRate, carret, currencyType } = req.body;

  // Update gold rate
  const updateObj = {
    lastUpdateAt: Date.now(),
  };
  if (goldRate) updateObj.goldRate = goldRate;
  if (carret) updateObj.carret = carret;
  if (currencyType) updateObj.currencyType = currencyType;

  const updatedGoldRate = await GoldRate.findByIdAndUpdate(
    req.params.id,
    updateObj,
    { new: true, runValidators: true }
  );

  if (!updatedGoldRate) {
    return next(new AppError("No gold rate found with that ID", 404));
  }

  // Find all active gold alerts where the alert amount is >= the updated gold rate
  const activeAlerts = await GoldAlert.find({
    alertStatus: "Active",
    alertAmount: { $lte: updatedGoldRate.goldRate }, // Find alerts with amount <= updated gold rate
  }).populate("user", "fcmToken"); // Populate user details to get FCM token

  if (activeAlerts.length > 0) {
    // Send notifications to users with matching alerts
    for (const alert of activeAlerts) {
      const user = alert.user;

      // Send FCM notification
      if (user.fcmToken) {
        const payload = {
          notification: {
            title: "Gold Rate Alert",
            body: `The gold rate has dropped to ${updatedGoldRate.goldRate}. Your alert for ${alert.alertAmount} has been triggered.`,
          },
          token: user.fcmToken,
        };

        try {
          await Notification.create({
            userId: user._id,
            title: "Gold Rate Alert",
            message: `The gold rate has dropped to ${updatedGoldRate.goldRate}. Your alert for ${alert.alertAmount} has been triggered.`,
            type: "goldAlert",
          });
          await admin.messaging().send(payload);
          console.log(`Notification sent to user ${user._id}`);
        } catch (error) {
          console.error("Error sending FCM notification:", error);
        }
      }

      // Update the alert status to "Inactive"
      alert.alertStatus = "Inactive";
      await alert.save();
    }
  }

  res.status(200).json({
    status: true,
    message: "Gold rate updated successfully",
    data: {
      updatedGoldRate,
    },
  });
});
