const EmiList = require("../../../models/emiList");
const Transaction = require("../../../models/transaction");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const generateInvoice = require("../../user/plan/generateInvoice");

exports.createChequePayment = catchAsync(async (req, res, next) => {
    const { user, userPlan, amount, emiNumber } = req.body; 
  
    const collectionAgent = req.user._id;

     let chequeImage = "";
    
      if (req.files && req.files.chequeImage) {
        chequeImage = `${req.files.chequeImage[0].destination}/${req.files.chequeImage[0].filename}`;
      } else {
        return next(new AppError("chequeImage is required", 400));
      }
  
    // Input validations
    if (!user) return next(new AppError("Please provide user ID.", 400));
    if (!userPlan) return next(new AppError("User Plan is required.", 400));
    if (!amount) return next(new AppError("Amount is required.", 400));
    if (!emiNumber) return next(new AppError("EMI month (emiNumber) is required.", 400));
  
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
  
    // Generate random orderId and transactionId
    const orderId = `CHEQUE_${Date.now()}`;
    const transactionId = crypto.randomBytes(8).toString("hex");
  
    // Create a transaction for the cheque payment
    const transaction = await Transaction.create({
      user,
      userPlan,
      amount: emiToPay.monthlyAdvance,
      status: "Pending", // Initially pending until cheque is verified
      paymentType: "Cheque",
      orderId,
      transactionId,
      checqueImage: chequeImage, // Store the cheque image reference
    });
  
    // Update the EMI entry
    emiToPay.status = "Pending"; // Status remains pending until admin verification
    emiToPay.paidDate = new Date();
    emiToPay.transaction = transaction._id;
  
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
      dueDate: nextDueDate,
      transactionId,
    });
  
    await emiList.save();
  
    res.status(201).json({
      status: true,
      message: `Cheque payment submitted for EMI month ${emiNumber}. Awaiting verification.`,
      data: {
        transaction,
        emiDetails: emiToPay,
      },
    });
  });