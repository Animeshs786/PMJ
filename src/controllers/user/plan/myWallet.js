// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const catchAsync = require("../../../utils/catchAsync");
// const Plan = require("../../../models/plan");

// exports.myWallet = catchAsync(async (req, res) => {
//   try {
//     const userId = req.user._id;
//     // const plans = await Plan.find().select("name validDeposit");
//     let totalAmountWallet = 0;

//     const activeUserPlans = await UserPlan.find({
//       user: userId,
//       status: "Active",
//     }).populate({
//       path: "plan",
//       select: "name commitedAmount",
//     });

//     const usersWithEmiDetails = await Promise.all(
//       activeUserPlans.map(async (userPlan) => {
//         console.log(userPlan);
//         const emiList = await EmiList.findOne({
//           user: userPlan.user._id,
//           userPlan: userPlan._id,
//         });

//         const paidPaymentsCount = emiList.emiList.filter(
//           (emi) => emi.status === "Paid"
//         ).length;

//         const totalPaidAmount = emiList.emiList.reduce((total, emi) => {
//           if (emi.status === "Paid") {
//             return total + userPlan.commitedAmount;
//           }
//           return total;
//         }, 0);

//         totalAmountWallet += totalPaidAmount;

//         return {
//           planStartDate: userPlan.planStartDate,
//           planEndDate: userPlan.planEndDate,
//           totalPayments: emiList.emiList.length,
//           paidPayments: paidPaymentsCount,
//           totalPaidAmount,
//           commitedAmount: userPlan.commitedAmount,
//           planName: userPlan.plan.name,
//         };
//       })
//     );

//     res.status(200).json({
//       status: true,
//       message: "My Wallet fetched successfully.",
//       data: usersWithEmiDetails,
//       totalAmountWallet,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

exports.myWallet = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    let totalAmountWallet = 0;

    // Fetch active user plans
    const activeUserPlans = await UserPlan.find({
      user: userId,
      status: "Active",
    }).populate({
      path: "plan",
      select: "name commitedAmount",
    });

    // Process each user plan
    const usersWithEmiDetails = await Promise.all(
      activeUserPlans.map(async (userPlan) => {
        // Fetch EMI list for the user plan
        const emiList = await EmiList.findOne({
          user: userPlan.user._id,
          userPlan: userPlan._id,
        });

        // Count paid payments
        const paidPaymentsCount = emiList.emiList.filter(
          (emi) => emi.status === "Paid"
        ).length;

        // Calculate total paid amount
        let totalPaidAmount = emiList.emiList.reduce((total, emi) => {
          if (emi.status === "Paid") {
            return total + userPlan.commitedAmount;
          }
          return total;
        }, 0);

        // If 11 payments are paid, add the committed amount as the 12th payment (reward)
        if (paidPaymentsCount === 11) {
          totalPaidAmount += userPlan.commitedAmount;
        }

        // Add to total wallet amount
        totalAmountWallet += totalPaidAmount;

        return {
          planStartDate: userPlan.planStartDate,
          planEndDate: userPlan.planEndDate,
          totalPayments: emiList.emiList.length,
          paidPayments: paidPaymentsCount,
          totalPaidAmount,
          commitedAmount: userPlan.commitedAmount,
          planName: userPlan.plan.name,
        };
      })
    );

    res.status(200).json({
      status: true,
      message: "My Wallet fetched successfully.",
      data: usersWithEmiDetails,
      totalAmountWallet,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});