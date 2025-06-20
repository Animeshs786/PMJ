const Transaction = require("../../../models/transaction");
const EmiList = require("../../../models/emiList");
const crypto = require("crypto");
const generateInvoice = require("../plan/generateInvoice");
const UserPlan = require("../../../models/userPlan");

exports.transactionWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  console.log("transtion webhook");
  try {
    const bodyString = JSON.stringify(req.body);
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(bodyString);
    const digest = shasum.digest("hex");

    if (digest === req.headers["x-razorpay-signature"]) {
      const event = req.body;
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      console.log(event.event, "event.event");
      if (!orderId) {
        console.error("Order ID is null. Cannot proceed.");
        return res
          .status(400)
          .json({ status: "error", message: "Order ID is null" });
      }

      const transaction = await Transaction.findOneAndUpdate(
        { orderId },
        {
          status: event.event === "payment.captured" ? "Success" : "Failed",
          transactionId: paymentEntity.id,
        },
        { new: true }
      );

      const userPlan = await UserPlan.findById(transaction.userPlan)
        .populate("planDock", "name billingAddress1")
        .populate("plan", "name");

      console.log(userPlan, "userPlan*********************************");

      if (transaction) {
        const emiList = await EmiList.findOne({
          "emiList.transaction": transaction._id,
        });

        if (emiList) {
          const emi = emiList.emiList.find((e) =>
            e.transaction.equals(transaction._id)
          );

          if (emi) {
            if (event.event === "payment.captured") {
              emi.status = "Paid";
              emi.paidDate = new Date();
              console.log("sldfjlsdfjlsdjflsjdf", transaction);

              // Determine the next due date
              const currentDueDate = new Date(emi.dueDate);
              const nextDueDate = new Date(currentDueDate);
              nextDueDate.setMonth(nextDueDate.getMonth() + 1); // Assuming EMI is monthly

              // Generate the invoice
              emi.invoice = await generateInvoice({
                name: userPlan.planDock?.name,
                address: userPlan.planDock?.billingAddress1,
                startDate: userPlan.planStartDate,
                endDate: userPlan.planEndDate,
                maturityDate: userPlan.maturityDate,
                redemptionValue: userPlan.redemptionValue,
                planName: userPlan.plan?.name,
                paidMonth: emi.month,
                amountPaid: emi.monthlyAdvance,
                planId: userPlan._id,
                dueDate: nextDueDate,
                digitalAccount:userPlan?.digitalAccount,
                transactionId: transaction.transactionId,
              });

              await emiList.save();
            } else {
              emi.status = "Fail";
              await emiList.save();
            }
          }

          userPlan.status = "Active";
          await userPlan.save();
        }
      }

      res.status(200).json({ status: "ok" });
    } else {
      res.status(400).json({ status: "invalid signature" });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
