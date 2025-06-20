// const UserPlan = require("../../../models/userPlan");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");

// // API 1: Close/Forclose a User Plan
// exports.closeUserPlan = catchAsync(async (req, res, next) => {
//   const { planId, remark } = req.body;

//   // Validate input
//   if (!planId) {
//     return next(new AppError("Plan ID is required", 400));
//   }

//   // Find the plan
//   const plan = await UserPlan.findById(planId);
//   if (!plan) {
//     return next(new AppError("User plan not found", 404));
//   }

//   // Check if plan is already Forclosed or Completed
//   if (["Forclosed", "Completed"].includes(plan.status)) {
//     return next(new AppError(`Plan is already ${plan.status}`, 400));
//   }

//   // Update plan status to Forclosed and optionally set remark
//   plan.status = "Forclosed";
//   if (remark && typeof remark === "string" && remark.trim()) {
//     plan.remark = remark.trim();
//   }

//   await plan.save();

//   res.status(200).json({
//     status: true,
//     message: "Plan Closed Successfully",
//     data: {
//       plan,
//     },
//   });
// });

// // API 2: Manage isRedem Status
// exports.manageIsRedemStatus = catchAsync(async (req, res, next) => {
//   const { planId, isRedem, redemptionDate } = req.body;

//   // Validate input
//   if (!planId) {
//     return next(new AppError("Plan ID is required", 400));
//   }
//   if (typeof isRedem !== "boolean") {
//     return next(new AppError("isRedem must be a boolean", 400));
//   }

//   // Find the plan
//   const plan = await UserPlan.findById(planId);
//   if (!plan) {
//     return next(new AppError("User plan not found", 404));
//   }

//   // Update isRedem status
//   plan.isRedem = isRedem;

//   // Handle redemptionDate if isRedem is true
//   if (isRedem) {
//     if (redemptionDate) {
//       const parsedDate = new Date(redemptionDate);
//       if (isNaN(parsedDate)) {
//         return next(new AppError("Invalid redemptionDate format", 400));
//       }
//       plan.redemptionDate = parsedDate;
//     } else {
//       // Set redemptionDate to current date if not provided
//       plan.redemptionDate = new Date();
//     }
//   } else {
//     // Clear redemptionDate if isRedem is false
//     plan.redemptionDate = undefined;
//   }

//   await plan.save();

//   res.status(200).json({
//     status: true,
//     data: {
//       plan,
//     },
//   });
// });

// exports.completeUserPlan = catchAsync(async (req, res, next) => {
//   const { planId, remark } = req.body;

//   // Validate input
//   if (!planId) {
//     return next(new AppError("Plan ID is required", 400));
//   }

//   // Find the plan
//   const plan = await UserPlan.findById(planId);
//   if (!plan) {
//     return next(new AppError("User plan not found", 404));
//   }

//   // Check if plan is already Forclosed or Completed
//   if (["Forclosed", "Completed"].includes(plan.status)) {
//     return next(new AppError(`Plan is already ${plan.status}`, 400));
//   }

//   // Update plan status to Forclosed and optionally set remark
//   plan.status = "Completed";
//   if (remark && typeof remark === "string" && remark.trim()) {
//     plan.remark = remark.trim();
//   }

//   await plan.save();

//   res.status(200).json({
//     status: true,
//     message: "Plan complete Successfully",
//     data: {
//       plan,
//     },
//   });
// });




const UserPlan = require("../../../models/userPlan");
const Notification = require("../../../models/notification");
const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const admin = require("../../../firebase/firebase");

// Function to send FCM notification
const sendFCMNotification = async (userId, title, message, type) => {
  const user = await User.findById(userId);
  if (!user || !user.fcmToken) return;

  const payload = {
    notification: {
      title,
      body: message,
    },
    data: {
      type,
    },
    token: user.fcmToken,
  };

  try {
    await admin.messaging().send(payload);
    console.log(`Notification sent via FCM to user ${userId}`);
  } catch (error) {
    console.error("Error sending FCM notification:", error);
  }
};

// API 1: Close/Forclose a User Plan
exports.closeUserPlan = catchAsync(async (req, res, next) => {
  const { planId, remark } = req.body;

  // Validate input
  if (!planId) {
    return next(new AppError("Plan ID is required", 400));
  }

  // Find the plan
  const plan = await UserPlan.findById(planId).populate("plan", "name");
  if (!plan) {
    return next(new AppError("User plan not found", 404));
  }

  // Check if plan is already Forclosed or Completed
  if (["Forclosed", "Completed"].includes(plan.status)) {
    return next(new AppError(`Plan is already ${plan.status}`, 400));
  }

  // Update plan status to Forclosed and optionally set remark
  plan.status = "Forclosed";
  if (remark && typeof remark === "string" && remark.trim()) {
    plan.remark = remark.trim();
  }

  plan.forclosedDate= new Date();

  await plan.save();

  // Create notification for plan closure
  const notificationTitle = "Plan Closed";
  const notificationMessage = `Your plan "${plan.plan.name}" has been forclosed.`;
  const notificationType = "other";

  const newNotification = await Notification.create({
    userId: plan.user,
    title: notificationTitle,
    message: notificationMessage,
    type: notificationType,
    file: "",
  });

  // Send FCM notification
  await sendFCMNotification(plan.user, notificationTitle, notificationMessage, notificationType);

  res.status(200).json({
    status: true,
    message: "Plan Closed Successfully",
    data: {
      plan,
      notification: newNotification,
    },
  });
});

// API 2: Manage isRedem Status
exports.manageIsRedemStatus = catchAsync(async (req, res, next) => {
  const { planId, isRedem, redemptionDate } = req.body;

  // Validate input
  if (!planId) {
    return next(new AppError("Plan ID is required", 400));
  }
  if (typeof isRedem !== "boolean") {
    return next(new AppError("isRedem must be a boolean", 400));
  }

  // Find the plan
  const plan = await UserPlan.findById(planId).populate("plan", "name");
  if (!plan) {
    return next(new AppError("User plan not found", 404));
  }

  // Update isRedem status
  plan.isRedem = isRedem;

  // Handle redemptionDate if isRedem is true
  if (isRedem) {
    if (redemptionDate) {
      const parsedDate = new Date(redemptionDate);
      if (isNaN(parsedDate)) {
        return next(new AppError("Invalid redemptionDate format", 400));
      }
      plan.redemptionDate = parsedDate;
    } else {
      // Set redemptionDate to current date if not provided
      plan.redemptionDate = new Date();
    }
  } else {
    // Clear redemptionDate if isRedem is false
    plan.redemptionDate = undefined;
  }

  await plan.save();

  // Create notification for redemption status update
  const notificationTitle = "Redemption Status Updated";
  const notificationMessage = `Your plan "${plan.plan.name}" redemption status has been updated to ${isRedem ? "Redeemed" : "Not Redeemed"}. ${isRedem ? `Redemption Date: ${plan.redemptionDate.toISOString().split("T")[0]}` : ""}`;
  const notificationType = "other";

  const newNotification = await Notification.create({
    userId: plan.user,
    title: notificationTitle,
    message: notificationMessage,
    type: notificationType,
    file: "",
  });

  // Send FCM notification
  await sendFCMNotification(plan.user, notificationTitle, notificationMessage, notificationType);

  res.status(200).json({
    status: true,
    message: "Redemption status updated successfully",
    data: {
      plan,
      notification: newNotification,
    },
  });
});

// API 3: Complete a User Plan
exports.completeUserPlan = catchAsync(async (req, res, next) => {
  const { planId, remark } = req.body;

  // Validate input
  if (!planId) {
    return next(new AppError("Plan ID is required", 400));
  }

  // Find the plan
  const plan = await UserPlan.findById(planId).populate("plan", "name");
  if (!plan) {
    return next(new AppError("User plan not found", 404));
  }

  // Check if plan is already Forclosed or Completed
  if (["Forclosed", "Completed"].includes(plan.status)) {
    return next(new AppError(`Plan is already ${plan.status}`, 400));
  }

  // Update plan status to Completed and optionally set remark
  plan.status = "Completed";
  if (remark && typeof remark === "string" && remark.trim()) {
    plan.remark = remark.trim();
  }

  plan.completeDate= new Date();

  await plan.save();

  // Create notification for plan completion
  const notificationTitle = "Plan Completed";
  const notificationMessage = `Your plan "${plan.plan.name}" has been successfully completed.`;
  const notificationType = "other";

  const newNotification = await Notification.create({
    userId: plan.user,
    title: notificationTitle,
    message: notificationMessage,
    type: notificationType,
    file: "",
  });

  // Send FCM notification
  await sendFCMNotification(plan.user, notificationTitle, notificationMessage, notificationType);

  res.status(200).json({
    status: true,
    message: "Plan Completed Successfully",
    data: {
      plan,
      notification: newNotification,
    },
  });
});
