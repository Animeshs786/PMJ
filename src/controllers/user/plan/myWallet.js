const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");
const Plan = require("../../../models/plan");

exports.myWallet = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const plans = await Plan.find().select("name validDeposit");

    const activeUserPlans = await UserPlan.find({
      user: userId,
      status: "Active",
    }).populate({
      path: "plan",
      select: "name commitedAmount",
    });

    const planDetails = await Promise.all(
      plans.map(async (plan) => {
        const usersForPlan = activeUserPlans.filter(
          (userPlan) => userPlan.plan._id.toString() === plan._id.toString()
        );

        const usersWithEmiDetails = await Promise.all(
          usersForPlan.map(async (userPlan) => {
            const emiList = await EmiList.findOne({
              user: userPlan.user._id,
              userPlan: userPlan._id,
            });

            const paidPaymentsCount = emiList.emiList.filter(
              (emi) => emi.status === "Paid"
            ).length;

            const totalPaidAmount = emiList.emiList.reduce((total, emi) => {
              if (emi.status === "Paid") {
                return total + emi.monthlyAdvance;
              }
              return total;
            }, 0);

            return {
              planStartDate: userPlan.planStartDate,
              planEndDate: userPlan.planEndDate,
              totalPayments: emiList.emiList.length,
              paidPayments: paidPaymentsCount,
              totalPaidAmount,
              commitedAmount: userPlan.commitedAmount,
            };
          })
        );

        return {
          plan: plan.name,
          validDeposit: plan.validDeposit,
          users: usersWithEmiDetails,
        };
      })
    );

    res.status(200).json({
      status: true,
      message: "My Wallet fetched successfully.",
      data: planDetails,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
