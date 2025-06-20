const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");
const moment = require("moment-timezone");

moment.tz.setDefault("Asia/Kolkata");

exports.schedulePlan = catchAsync(async () => {
  // Get current date and normalize to start of day in Asia/Kolkata timezone
  const currentDate = moment().tz("Asia/Kolkata").startOf("day");

  // Define start and end of today for comparison
  const startOfToday = currentDate.toDate();
  const endOfToday = currentDate.endOf("day").toDate();

  // Find plans that are Active and have maturityDate on or before today
  const plansToUpdate = await UserPlan.find({
    status: "Active",
    maturityDate: { $lte: endOfToday },
  });

  if (plansToUpdate.length === 0) {
    console.log("No plans found to update.");
    return;
  }

  // Update plans to Completed
  const updatePromises = plansToUpdate.map((plan) =>
    UserPlan.findByIdAndUpdate(plan._id, { status: "Completed" }, { new: true })
  );

  const updatedPlans = await Promise.all(updatePromises);
  console.log(
    `Successfully updated ${updatedPlans.length} plan(s) to Completed.`
  );

  return updatedPlans;
});
