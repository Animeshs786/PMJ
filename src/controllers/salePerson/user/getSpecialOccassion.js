const User = require("../../../models/user");
const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");

exports.getSpecialOccasions = catchAsync(async (req, res, next) => {
  const { userId: salePersonId } = req.user;

  if (!salePersonId) {
    return res.status(400).json({
      status: false,
      message: "Sale Person ID is required.",
    });
  }

  const today = new Date();
  const todayMonthDay = `${today.getMonth() + 1}-${today.getDate()}`; // Format: MM-DD

  // Fetch all user plans mapped with the salesperson
  const userPlans = await UserPlan.find({ salePersonId }).populate(
    "user",
    "name email mobile dob aniversaryDate"
  );

  const birthdays = [];
  const anniversaries = [];
  const seenBirthdays = new Set();
  const seenAnniversaries = new Set();

  userPlans.forEach((plan) => {
    const { user } = plan;

    if (user) {
      const userId = user._id.toString();

      // Check for birthday
      if (user.dob) {
        const dobParts = user.dob.split("-"); // Split the date string (YYYY-MM-DD)
        const dobMonthDay = `${parseInt(dobParts[1])}-${parseInt(dobParts[2])}`;
        if (dobMonthDay === todayMonthDay && !seenBirthdays.has(userId)) {
          seenBirthdays.add(userId);
          birthdays.push({
            userId,
            name: user.name || "",
            email: user.email || "",
            mobile: user.mobile || "",
            occasion: "Birthday",
          });
        }
      }

      // Check for anniversary
      if (user.aniversaryDate) {
        const anniversaryParts = user.aniversaryDate.split("-"); // Split the date string (YYYY-MM-DD)
        const anniversaryMonthDay = `${parseInt(anniversaryParts[1])}-${parseInt(anniversaryParts[2])}`;
        if (anniversaryMonthDay === todayMonthDay && !seenAnniversaries.has(userId)) {
          seenAnniversaries.add(userId);
          anniversaries.push({
            userId,
            name: user.name || "",
            email: user.email || "",
            mobile: user.mobile || "",
            occasion: "Anniversary",
          });
        }
      }
    }
  });

  res.status(200).json({
    status: true,
    data: {
      birthdays,
      anniversaries,
    },
  });
});
