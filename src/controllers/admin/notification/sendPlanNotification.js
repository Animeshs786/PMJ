const EmiList = require("../../../models/emiList");
const Notification = require("../../../models/notification");
const User = require("../../../models/user");
const admin = require("../../../firebase/firebase");
const UserPlan = require("../../../models/userPlan");

// Function to send FCM notification
const sendFCMNotification = async (userId, title, message, type) => {
  try {
    const user = await User.findById(userId).select("fcmToken");
    if (!user || !user.fcmToken) {
      console.log(`No FCM token found for user ${userId}`);
      return;
    }

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

    await admin.messaging().send(payload);
    console.log(`FCM notification sent to user ${userId}`);
  } catch (error) {
    console.error(`Error sending FCM notification to user ${userId}:`, error);
  }
};

// Function to create and send notifications for eligible plans
exports.sendPlanNotifications = async () => {
  try {
    console.log(
      "Starting daily plan notification job at",
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    );

    // Step 1: Find plans with exactly 10 paid EMIs (Upcoming Maturity)
    const upcomingMaturityPlans = await EmiList.aggregate([
      {
        $match: {
          "emiList.status": "Paid",
        },
      },
      {
        $unwind: "$emiList",
      },
      {
        $match: { "emiList.status": "Paid" },
      },
      {
        $group: {
          _id: "$userPlan",
          paidCount: { $sum: 1 },
        },
      },
      {
        $match: { paidCount: 10 },
      },
      {
        $project: { _id: 1 },
      },
    ]);

    const upcomingPlanIds = upcomingMaturityPlans.map((plan) => plan._id);

    // Step 2: Find plans with exactly 11 paid EMIs (Pending Redemption)
    const pendingRedemptionPlans = await EmiList.aggregate([
      {
        $match: {
          "emiList.status": "Paid",
        },
      },
      {
        $unwind: "$emiList",
      },
      {
        $match: { "emiList.status": "Paid" },
      },
      {
        $group: {
          _id: "$userPlan",
          paidCount: { $sum: 1 },
        },
      },
      {
        $match: { paidCount: 11 },
      },
      {
        $project: { _id: 1 },
      },
    ]);

    const pendingPlanIds = pendingRedemptionPlans.map((plan) => plan._id);

    // Step 3: Fetch eligible UserPlans with isRedem: false
    const eligiblePlans = await UserPlan.find({
      _id: { $in: [...upcomingPlanIds, ...pendingPlanIds] },
      isRedem: false,
    })
      .populate("user", "name")
      .populate("plan", "name")
      .lean();

    if (!eligiblePlans.length) {
      console.log("No eligible plans found for notifications.");
      return;
    }

    // Step 4: Group plans by user and type (upcoming or pending)
    const userNotifications = {};

    for (const plan of eligiblePlans) {
      const userId = plan.user._id.toString();
      const planName = plan.plan.name;
      const isUpcoming = upcomingPlanIds.includes(plan._id.toString());
      const type = isUpcoming ? "upcoming" : "pending";

      if (!userNotifications[userId]) {
        userNotifications[userId] = {
          upcoming: [],
          pending: [],
          userName: plan.user.name,
        };
      }

      userNotifications[userId][type].push(planName);
    }

    // Step 5: Create and send notifications for each user
    for (const [userId, data] of Object.entries(userNotifications)) {
      const { upcoming, pending, userName } = data;

      // Construct notification message
      let message = `Hello ${userName}, `;
      const parts = [];

      if (upcoming.length) {
        parts.push(
          `you have ${upcoming.length} upcoming maturity plan${
            upcoming.length > 1 ? "s" : ""
          }: ${upcoming.join(", ")}.`
        );
      }

      if (pending.length) {
        parts.push(
          `you have ${pending.length} pending redemption plan${
            pending.length > 1 ? "s" : ""
          }: ${pending.join(", ")}. Please redeem them soon.`
        );
      }

      message += parts.join(" ");

      // Create notification
      const notificationTitle = "Plan Status Reminder";
      const notificationType = "other";

      await Notification.create({
        userId,
        title: notificationTitle,
        message,
        type: notificationType,
        file: "",
      });

      // Send FCM notification
      await sendFCMNotification(
        userId,
        notificationTitle,
        message,
        notificationType
      );

      console.log(`Notification created for user ${userId}: ${message}`);
    }

    console.log("Daily plan notification job completed successfully.");
  } catch (error) {
    console.error("Error in daily plan notification job:", error);
  }
};
