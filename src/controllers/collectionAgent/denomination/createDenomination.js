// const Denomination = require("../../models/denomination"); // Update the path based on your folder structure
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.createDenomination = catchAsync(async (req, res, next) => {
//   const {
//     user,
//     userPlan,
//     tenRupeesQty = 0,
//     twentyRupeesQty = 0,
//     fiftyRupeesQty = 0,
//     hundredRupeesQty = 0,
//     twoHundredRupeesQty = 0,
//     fiveHundredRupeesQty = 0,
//     amount,
//     emiNumber,
//   } = req.body;
//   const collectionAgent = req.user._id;

//   if (!user) return next(new AppError("Please provide user id.", 400));
//   if (!userPlan) return next(new AppError("User Plan must be required.", 400));
//   if (!amount) return next(new AppError("Amount must be required", 400));
//   if (!emiNumber) return next(new AppError("Emi number must be required", 400));

//   const calculatedAmount =
//     tenRupeesQty * 10 +
//     twentyRupeesQty * 20 +
//     fiftyRupeesQty * 50 +
//     hundredRupeesQty * 100 +
//     twoHundredRupeesQty * 200 +
//     fiveHundredRupeesQty * 500;

//   if (amount !== calculatedAmount) {
//     return next(new AppError("Amount is not valid.", 400));
//   }

//   const denomination = await Denomination.create({
//     user,
//     userPlan,
//     collectionAgent,
//     tenRupeesQty,
//     twentyRupeesQty,
//     fiftyRupeesQty,
//     hundredRupeesQty,
//     twoHundredRupeesQty,
//   });

//   res.status(201).json({
//     status: true,
//     message: "Denomination created successfully.",
//     data: {
//       denomination,
//     },
//   });
// });

const Transaction = require("../../../models/transaction");
const EmiList = require("../../../models/emiList");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const crypto = require("crypto");
const Denomination = require("../../../models/denomination");
const generateInvoice = require("../../user/plan/generateInvoice");

exports.createDenomination = catchAsync(async (req, res, next) => {
  const {
    user,
    userPlan,
    tenRupeesQty = 0,
    twentyRupeesQty = 0,
    fiftyRupeesQty = 0,
    hundredRupeesQty = 0,
    twoHundredRupeesQty = 0,
    fiveHundredRupeesQty = 0,
    amount,
    emiNumber, // This is the month for the EMI
  } = req.body;

  const collectionAgent = req.user._id;

  // Input validations
  if (!user) return next(new AppError("Please provide user ID.", 400));
  if (!userPlan) return next(new AppError("User Plan is required.", 400));
  if (!amount) return next(new AppError("Amount is required.", 400));
  if (!emiNumber)
    return next(new AppError("EMI month (emiNumber) is required.", 400));

  // Validate the total amount
  const calculatedAmount =
    tenRupeesQty * 10 +
    twentyRupeesQty * 20 +
    fiftyRupeesQty * 50 +
    hundredRupeesQty * 100 +
    twoHundredRupeesQty * 200 +
    fiveHundredRupeesQty * 500;

  if (amount !== calculatedAmount) {
    return next(new AppError("Amount is not valid.", 400));
  }

  // Fetch the emiList for the user and plan
  const emiList = await EmiList.findOne({ user, userPlan });

  if (!emiList || emiList.emiList.length === 0) {
    return next(new AppError("No EMI list found for this user plan.", 404));
  }

  // Find the specific EMI to be paid based on the month (emiNumber)
  const emiToPay = emiList.emiList.find(
    (emi) => emi.month === emiNumber && emi.status === "Pending"
  );

  if (!emiToPay) {
    return next(
      new AppError("No pending EMI found for the specified month.", 404)
    );
  }

  // Find the next due EMI after the current one
const nextEmi = emiList.emiList.find(
  (emi) => emi.month > emiToPay.month && emi.status === "Pending"
);

const nextDueDate = nextEmi ? nextEmi.dueDate : emiToPay.dueDate;

  // Create a denomination record
  const denomination = await Denomination.create({
    user,
    userPlan,
    collectionAgent,
    tenRupeesQty,
    twentyRupeesQty,
    fiftyRupeesQty,
    hundredRupeesQty,
    twoHundredRupeesQty,
    fiveHundredRupeesQty,
    emiNumber,
  });

  // Generate random orderId and transactionId
  const orderId = `OFFLINE_${Date.now()}`;
  const transactionId = crypto.randomBytes(8).toString("hex");

  // Create a transaction for the offline payment
  const transaction = await Transaction.create({
    user,
    userPlan,
    amount: emiToPay.monthlyAdvance,
    status: "Success",
    paymentType: "Offline",
    orderId,
    transactionId,
  });

  // Update the EMI entry
  emiToPay.status = "Paid";
  emiToPay.paidDate = new Date();
  emiToPay.transaction = transaction._id;
  emiToPay.denomination = denomination._id;

  const userPlanDetail = await UserPlan.findById(userPlan).populate(
    "planDock",
    "name billingAddress1"
  );

  // Generate the invoice
  emiToPay.invoice = await generateInvoice({
    name: userPlanDetail.planDock?.name,
    address: userPlanDetail.planDock?.billingAddress1,
    startDate: userPlanDetail.planStartDate,
    endDate: userPlanDetail.planEndDate,
    maturityDate: userPlanDetail.maturityDate,
    redemptionValue: userPlanDetail.redemptionValue,
    planName: userPlanDetail.plan?.name,
    paidMonth: emiToPay.month,
    amountPaid: emiToPay.monthlyAdvance,
    planId: userPlanDetail._id,
    dueDate:nextDueDate,
    transactionId,
  });

  await emiList.save();

  res.status(201).json({
    status: true,
    message: `Offline payment successful for EMI month ${emiNumber}.`,
    data: {
      denomination,
      transaction,
      emiDetails: emiToPay,
    },
  });
});
