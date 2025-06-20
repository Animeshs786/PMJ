

// const UserPlan = require("../../../models/userPlan");
// const EmiList = require("../../../models/emiList");
// const Plan = require("../../../models/plan");
// const Discount = require("../../../models/discount");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");
// const PlanDock = require("../../../models/planDock");

// exports.initiateUserPlan = catchAsync(async (req, res, next) => {
//   const { planId, planDock } = req.body;
//   const userId = req.user._id;
//   const digitalAccount = req.user.digitalAccount;

//   // Fetch the plan by ID
//   const plan = await Plan.findById(planId);
//   if (!plan) {
//     return next(new AppError("No plan found with that ID", 404));
//   }

//   const commitedAmount = plan.commitedAmount;
//   const planDockData = await PlanDock.findById(planDock);
//   if (!planDockData) {
//     return next(new AppError("No planDock found with that ID", 404));
//   }

//   // Fetch all discounts
//   const discounts = await Discount.find();
//   if (!discounts || discounts.length === 0) {
//     return next(new AppError("No discounts available", 404));
//   }

//   let initialDiscount = 0;

//   // Calculate the maximum applicable discount
//   for (const discount of discounts) {
//     if (commitedAmount >= discount.amount) {
//       initialDiscount = (commitedAmount * discount.discountValue) / 100;
//     }
//   }

//   const amountAfterDiscount = commitedAmount - initialDiscount;
//   const rewardAmount = commitedAmount;
//   const advancePaid =
//     commitedAmount * plan.advancePaymentNumber - initialDiscount;
//   const overAllBenefits = rewardAmount + initialDiscount;
//   const redemptionValue = advancePaid + overAllBenefits;

//   // Set plan dates
//   const planStartDate = new Date();
//   const planEndDate = new Date(planStartDate);
//   planEndDate.setMonth(
//     planEndDate.getMonth() + (plan.advancePaymentNumber - 1)
//   ); // Set to 10 months from start for 11 EMIs
//   const maturityDate = new Date(planStartDate);
//   maturityDate.setDate(maturityDate.getDate() + 330); // Set to 330 days from start (2026-04-01)

//   // Create the user plan
//   const newUserPlan = await UserPlan.create({
//     user: userId,
//     plan: planId,
//     planStartDate,
//     planDock: planDock,
//     planEndDate,
//     maturityDate,
//     initialDiscount,
//     firstDiscount: initialDiscount,
//     rewardAmount,
//     amountAfterDiscount,
//     advancePaid,
//     overAllBenefits,
//     redemptionValue,
//     advancePaymentNumber: plan.advancePaymentNumber,
//     commitedAmount,
//     status: "Initiated",
//     digitalAccount,
//     salePersonId: planDockData.salePersonId || "",
//   });

//   // Create EMI schedule
//   const emiList = [];
//   const currentDate = new Date();
//   const paymentNumber = plan.advancePaymentNumber;

//   // Helper function to format date as "yyyy-mm-dd"
//   const formatDate = (date) => {
//     const year = date.getFullYear();
//     const month = (date.getMonth() + 1).toString().padStart(2, "0");
//     const day = date.getDate().toString().padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   for (let i = 0; i < paymentNumber + 1; i++) {
//     const dueDate = new Date(
//       currentDate.getFullYear(),
//       currentDate.getMonth() + i,
//       currentDate.getDate()
//     );
//     const status = i < paymentNumber ? "Pending" : "Bonus";

//     // For the bonus EMI, set the due date to the maturity date
//     if (status === "Bonus") {
//       dueDate.setFullYear(maturityDate.getFullYear());
//       dueDate.setMonth(maturityDate.getMonth());
//       dueDate.setDate(maturityDate.getDate());
//     }

//     emiList.push({
//       month: i + 1,
//       monthlyAdvance: i === 0 ? amountAfterDiscount : commitedAmount,
//       status,
//       dueDate: formatDate(dueDate),
//       paidDate: "",
//     });
//   }

//   // Save EMI list to the database
//   await EmiList.create({
//     user: userId,
//     userPlan: newUserPlan._id,
//     emiList,
//   });

//   // Send response
//   res.status(201).json({
//     status: true,
//     message: "Plan initiated successfully.",
//     data: {
//       userPlan: newUserPlan,
//       emiList,
//     },
//   });
// });



const UserPlan = require("../../../models/userPlan");
const EmiList = require("../../../models/emiList");
const Plan = require("../../../models/plan");
const Discount = require("../../../models/discount");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const PlanDock = require("../../../models/planDock");

exports.initiateUserPlan = catchAsync(async (req, res, next) => {
  const { planId, planDock } = req.body;
  const userId = req.user._id;
  const digitalAccount = req.user.digitalAccount;

  // Fetch the plan by ID
  const plan = await Plan.findById(planId);
  if (!plan) {
    return next(new AppError("No plan found with that ID", 404));
  }

  const commitedAmount = plan.commitedAmount;
  const planDockData = await PlanDock.findById(planDock);
  if (!planDockData) {
    return next(new AppError("No planDock found with that ID", 404));
  }

  // Fetch all discounts
  const discounts = await Discount.find();
  if (!discounts || discounts.length === 0) {
    return next(new AppError("No discounts available", 404));
  }

  let initialDiscount = 0;
  let discountPercentage = 0; // Initialize discountPercentage

  // Calculate the maximum applicable discount and capture discountPercentage
  for (const discount of discounts) {
    if (commitedAmount >= discount.amount) {
      initialDiscount = (commitedAmount * discount.discountValue) / 100;
      discountPercentage = discount.discountValue; // Capture the discount percentage
    }
  }

  const amountAfterDiscount = commitedAmount - initialDiscount;
  const rewardAmount = commitedAmount;
  const advancePaid =
    commitedAmount * plan.advancePaymentNumber - initialDiscount;
  const overAllBenefits = rewardAmount + initialDiscount;
  const redemptionValue = advancePaid + overAllBenefits;

  // Set plan dates
  const planStartDate = new Date();
  const planEndDate = new Date(planStartDate);
  planEndDate.setMonth(
    planEndDate.getMonth() + (plan.advancePaymentNumber - 1)
  ); // Set to 10 months from start for 11 EMIs
  const maturityDate = new Date(planStartDate);
  maturityDate.setDate(maturityDate.getDate() + 330); // Set to 330 days from start

  // Create the user plan with discountPercentage
  const newUserPlan = await UserPlan.create({
    user: userId,
    plan: planId,
    planStartDate,
    planDock: planDock,
    planEndDate,
    maturityDate,
    initialDiscount,
    firstDiscount: initialDiscount,
    rewardAmount,
    amountAfterDiscount,
    advancePaid,
    overAllBenefits,
    redemptionValue,
    advancePaymentNumber: plan.advancePaymentNumber,
    commitedAmount,
    status: "Initiated",
    digitalAccount,
    salePersonId: planDockData.salePersonId || "",
    discountPercentage, // Add discountPercentage to the UserPlan document
  });

  // Create EMI schedule
  const emiList = [];
  const currentDate = new Date();
  const paymentNumber = plan.advancePaymentNumber;

  // Helper function to format date as "yyyy-mm-dd"
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  for (let i = 0; i < paymentNumber + 1; i++) {
    const dueDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + i,
      currentDate.getDate()
    );
    const status = i < paymentNumber ? "Pending" : "Bonus";

    // For the bonus EMI, set the due date to the maturity date
    if (status === "Bonus") {
      dueDate.setFullYear(maturityDate.getFullYear());
      dueDate.setMonth(maturityDate.getMonth());
      dueDate.setDate(maturityDate.getDate());
    }

    emiList.push({
      month: i + 1,
      monthlyAdvance: i === 0 ? amountAfterDiscount : commitedAmount,
      status,
      dueDate: formatDate(dueDate),
      paidDate: "",
    });
  }

  // Save EMI list to the database
  await EmiList.create({
    user: userId,
    userPlan: newUserPlan._id,
    emiList,
  });

  // Send response with discountPercentage
  res.status(201).json({
    status: true,
    message: "Plan initiated successfully.",
    data: {
      userPlan: {
        ...newUserPlan.toObject(),
        discountPercentage, // Include discountPercentage in the response
      },
      emiList,
    },
  });
});