// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const catchAsync = require("../../../utils/catchAsync");
// const AppError = require("../../../utils/AppError");
// const generateInvoice = require("./generateInvoice");
// const Razorpay = require("razorpay");
// const Transaction = require("../../../models/transaction");
// exports.payEmiBill = catchAsync(async (req, res, next) => {
//   const userId = req.user._id;
//   const { month, planId } = req.body;

//   const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZOR_KEY_ID_TEST,
//     key_secret: process.env.RAZOR_KEY_SECRET_TEST,
//   });

//   if (!planId) return next(new AppError("Plan ID is required", 400));

//   const userPlan = await UserPlan.findById(planId)
//     .populate("planDock", "name billingAddress1")
//     .populate("plan", "name");

//   if (!userPlan) {
//     return next(new AppError("No active or initiated plan found for this user", 404));
//   }

//   const emiList = await EmiList.findOne({ user: userId, userPlan: userPlan._id });

//   if (!emiList || emiList.emiList.length === 0) {
//     return next(new AppError("No EMI list found for this user plan", 404));
//   }

//   const emiToPay = emiList.emiList.find(
//     (emi) => emi.month === month && emi.status === "Pending"
//   );

//   if (!emiToPay) {
//     return next(new AppError("No pending EMI found for the specified month", 404));
//   }

//   const currentDate = new Date();
//   const emiDueDate = new Date(emiToPay.dueDate);
//   emiDueDate.setHours(23, 59, 59, 999);

//   if (currentDate > emiDueDate) {
//     return next(new AppError("Cannot pay overdue EMI. Please contact support.", 400));
//   }

//   const order = await razorpayInstance.orders.create({
//     amount: emiToPay.monthlyAdvance * 100,
//     currency: "INR",
//     receipt: `receipt_${Date.now()}`,
//   });

//   const transaction = await Transaction.create({
//     user: userId,
//     amount: emiToPay.monthlyAdvance,
//     status: "Pending",
//     orderId: order.id,
//     userPlan: userPlan._id,
//   });

//   emiToPay.status = "Pending";
//   emiToPay.transaction = transaction._id;

//   await emiList.save();

//   res.status(200).json({
//     status: true,
//     message: `Payment initiated for month ${emiToPay.month}. Please complete the payment.`,
//     data: {
//       month: emiToPay.month,
//       amountPaid: emiToPay.monthlyAdvance,
//       paidDate: emiToPay.paidDate?.toISOString()?.split("T")[0],
//       status: emiToPay.status,
//       orderId: order.id,
//     },
//   });
// });

const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const Notification = require("../../../models/notification");
const User = require("../../../models/user");
const Transaction = require("../../../models/transaction");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const Razorpay = require("razorpay");
const admin = require("../../../firebase/firebase");

exports.payEmiBill = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { month, planId } = req.body;

  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZOR_KEY_ID_TEST,
    key_secret: process.env.RAZOR_KEY_SECRET_TEST,
  });

  if (!planId) return next(new AppError("Plan ID is required", 400));

  const userPlan = await UserPlan.findById(planId)
    .populate("planDock", "name billingAddress1")
    .populate("plan", "name");

  if (!userPlan) {
    return next(
      new AppError("No active or initiated plan found for this user", 404)
    );
  }

  const emiList = await EmiList.findOne({
    user: userId,
    userPlan: userPlan._id,
  });

  if (!emiList || emiList.emiList.length === 0) {
    return next(new AppError("No EMI list found for this user plan", 404));
  }

  const emiToPay = emiList.emiList.find(
    (emi) => emi.month === month && emi.status === "Pending"
  );

  if (!emiToPay) {
    return next(
      new AppError("No pending EMI found for the specified month", 404)
    );
  }

  const currentDate = new Date();
  const emiDueDate = new Date(emiToPay.dueDate);
  emiDueDate.setHours(23, 59, 59, 999);

  if (currentDate > emiDueDate) {
    return next(
      new AppError("Cannot pay overdue EMI. Please contact support.", 400)
    );
  }

  const order = await razorpayInstance.orders.create({
    amount: emiToPay.monthlyAdvance * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  const transaction = await Transaction.create({
    user: userId,
    amount: emiToPay.monthlyAdvance,
    status: "Pending",
    orderId: order.id,
    userPlan: userPlan._id,
  });

  emiToPay.status = "Pending";
  emiToPay.transaction = transaction._id;

  await emiList.save();

  // Create notification for EMI payment initiation
  const notificationTitle = "EMI Payment Initiated";
  const notificationMessage = `You have initiated a payment of ₹${emiToPay.monthlyAdvance} for ${emiToPay.month} of your plan "${userPlan.plan.name}".`;
  const notificationType = "other";

  const newNotification = await Notification.create({
    userId,
    title: notificationTitle,
    message: notificationMessage,
    type: notificationType,
    file: "", // No file for this notification
  });

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

  // Send FCM notification to the user
  await sendFCMNotification(
    userId,
    notificationTitle,
    notificationMessage,
    notificationType
  );

  res.status(200).json({
    status: true,
    message: `Payment initiated for month ${emiToPay.month}. Please complete the payment.`,
    data: {
      month: emiToPay.month,
      amountPaid: emiToPay.monthlyAdvance,
      paidDate: emiToPay.paidDate?.toISOString()?.split("T")[0],
      status: emiToPay.status,
      orderId: order.id,
      notification: newNotification,
    },
  });
});
