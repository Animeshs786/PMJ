// const UserPlan = require("../../../models/userPlan");
// const CuponCode = require("../../../models/cuponCode");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.applyCuponToPlan = catchAsync(async (req, res, next) => {
//   const { cuponName, userPlanId } = req.body;
//   console.log(req.body, "dslfjsldfj");

//   if (!cuponName || !userPlanId) {
//     return next(new AppError("Coupon name and UserPlan ID are required", 400));
//   }

//   const coupon = await CuponCode.findOne({ name: cuponName });
//   if (!coupon) {
//     return next(new AppError("Coupon not found", 404));
//   }

//   const userPlan = await UserPlan.findById(userPlanId);
//   if (!userPlan) {
//     return next(new AppError("User Plan not found", 404));
//   }

//   const now = new Date();

//   if (coupon.startDate && now < coupon.startDate) {
//     return next(new AppError("Coupon is not valid yet", 400));
//   }
//   if (coupon.endDate && now > coupon.endDate) {
//     return next(new AppError("Coupon has expired", 400));
//   }

//   const usedCoupons = await UserPlan.countDocuments({
//     cupon: coupon._id,
//     status: { $ne: "Initiated" },
//   });

//   if (coupon.noOfTimes && usedCoupons >= coupon.noOfTimes) {
//     return next(new AppError("Coupon usage limit reached", 400));
//   }

//   if (coupon.minOrderValue && userPlan.commitedAmount < coupon.minOrderValue) {
//     return next(
//       new AppError("Plan does not meet the minimum order value", 400)
//     );
//   }

//   if (
//     coupon.maxDiscountValue &&
//     userPlan.commitedAmount > coupon.maxDiscountValue
//   ) {
//     return next(
//       new AppError("Plan exceeds the maximum order value for this coupon", 400)
//     );
//   }

//   let discountValue;
//   if (coupon.type === "fixed") {
//     discountValue = coupon.value;
//   } else if (coupon.type === "percentage") {
//     discountValue = (userPlan.commitedAmount * coupon.value) / 100;
//     if (coupon.maxDiscountValue) {
//       discountValue = Math.min(discountValue, coupon.maxDiscountValue);
//     }
//   }

//   // Apply coupon to user plan
//   userPlan.cupon = coupon._id;
//   userPlan.cuponValue = discountValue;
//   userPlan.initialDiscount = discountValue;
//   userPlan.overAllBenefits = discountValue;
//   userPlan.amountAfterDiscount = userPlan.commitedAmount - discountValue;

//   await userPlan.save();

//   res.status(200).json({
//     status: true,
//     message: "Coupon applied successfully",
//   });
// });

const UserPlan = require("../../../models/userPlan");
const CuponCode = require("../../../models/cuponCode");
const EmiList = require("../../../models/emiList");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.applyCuponToPlan = catchAsync(async (req, res, next) => {
  const { cuponName, userPlanId } = req.body;
  console.log(req.body, "dslfjsldfj");

  if (!userPlanId) {
    return next(new AppError("Coupon name and UserPlan ID are required", 400));
  }
  if (cuponName) {
    const coupon = await CuponCode.findOne({ name: cuponName });
    if (!coupon) {
      return next(new AppError("Coupon not found", 404));
    }

    const userPlan = await UserPlan.findById(userPlanId);
    if (!userPlan) {
      return next(new AppError("User Plan not found", 404));
    }

    const now = new Date();

    if (coupon.startDate && now < coupon.startDate) {
      return next(new AppError("Coupon is not valid yet", 400));
    }
    if (coupon.endDate && now > coupon.endDate) {
      return next(new AppError("Coupon has expired", 400));
    }

    const usedCoupons = await UserPlan.countDocuments({
      cupon: coupon._id,
      status: { $ne: "Initiated" },
    });

    if (coupon.noOfTimes && usedCoupons >= coupon.noOfTimes) {
      return next(new AppError("Coupon usage limit reached", 400));
    }

    if (
      coupon.minOrderValue &&
      userPlan.commitedAmount < coupon.minOrderValue
    ) {
      return next(
        new AppError("Plan does not meet the minimum order value", 400)
      );
    }

    if (
      coupon.maxDiscountValue &&
      userPlan.commitedAmount > coupon.maxDiscountValue
    ) {
      return next(
        new AppError(
          "Plan exceeds the maximum order value for this coupon",
          400
        )
      );
    }

    let discountValue;
    if (coupon.type === "fixed") {
      discountValue = coupon.value;
    } else if (coupon.type === "percentage") {
      discountValue = (userPlan.commitedAmount * coupon.value) / 100;
      if (coupon.maxDiscountValue) {
        discountValue = Math.min(discountValue, coupon.maxDiscountValue);
      }
    }

    // Calculate the new amountAfterDiscount
    const amountAfterDiscount = userPlan.commitedAmount - discountValue;

    // Apply coupon to user plan
    userPlan.cupon = coupon._id;
    userPlan.cuponValue = discountValue;
    userPlan.initialDiscount = discountValue;
    userPlan.overAllBenefits = discountValue + +userPlan.commitedAmount;
    userPlan.amountAfterDiscount = amountAfterDiscount;
    const amountval = userPlan.commitedAmount * userPlan.advancePaymentNumber;
    userPlan.advancePaid = amountval - discountValue;

    // Save the updated user plan
    await userPlan.save();

    // Update the EMI list
    const emiList = await EmiList.findOne({ userPlan: userPlanId });
    if (emiList) {
      // Update the first EMI's monthlyAdvance to the new amountAfterDiscount
      emiList.emiList[0].monthlyAdvance = amountAfterDiscount;

      // Save the updated EMI list
      await emiList.save();
    }

    res.status(200).json({
      status: true,
      message: "Coupon applied successfully",
    });
  } else {
    const userPlan = await UserPlan.findById(userPlanId);
    if (!userPlan) {
      return next(new AppError("User Plan not found", 404));
    }
    userPlan.cupon = null;
    userPlan.cuponValue = 0;
    userPlan.amountAfterDiscount =
      userPlan.commitedAmount - userPlan.firstDiscount;
    userPlan.overAllBenefits = userPlan.commitedAmount + userPlan.firstDiscount;
    userPlan.initialDiscount = userPlan.firstDiscount;

    const amountval = userPlan.commitedAmount * userPlan.advancePaymentNumber;
    userPlan.advancePaid = amountval - userPlan.firstDiscount;

    // Update EMI list with previous discount
    const emiList = await EmiList.findOne({ userPlan: userPlanId });
    if (emiList) {
      emiList.emiList[0].monthlyAdvance = userPlan.amountAfterDiscount;
      await emiList.save();
    }

    await userPlan.save();

    return res.status(200).json({
      status: true,
      message: "Coupon removed, previous discount restored",
    });
  }
});

// const UserPlan = require("../../../models/userPlan");
// const CuponCode = require("../../../models/cuponCode");
// const EmiList = require("../../../models/emiList");
// const AppError = require("../../../utils/AppError");
// const catchAsync = require("../../../utils/catchAsync");

// exports.applyCuponToPlan = catchAsync(async (req, res, next) => {
//   const { cuponName, userPlanId } = req.body;

//   if (!userPlanId) {
//     return next(new AppError("UserPlan ID is required", 400));
//   }

//   const userPlan = await UserPlan.findById(userPlanId);
//   if (!userPlan) {
//     return next(new AppError("User Plan not found", 404));
//   }

//   // If coupon is empty, reset the applied coupon and restore previous discount
//   if (!cuponName) {
//     // Restore initial discount before applying the coupon
//     userPlan.cupon = null;
//     userPlan.cuponValue = 0;
//     userPlan.amountAfterDiscount = userPlan.commitedAmount - userPlan.initialDiscount;
//     userPlan.overAllBenefits = userPlan.initialDiscount;

//     // Update EMI list with previous discount
//     const emiList = await EmiList.findOne({ userPlan: userPlanId });
//     if (emiList) {
//       emiList.emiList[0].monthlyAdvance = userPlan.amountAfterDiscount;
//       await emiList.save();
//     }

//     await userPlan.save();

//     return res.status(200).json({
//       status: true,
//       message: "Coupon removed, previous discount restored",
//     });
//   }

//   // Find the coupon
//   const coupon = await CuponCode.findOne({ name: cuponName });
//   if (!coupon) {
//     return next(new AppError("Coupon not found", 404));
//   }

//   const now = new Date();

//   if (coupon.startDate && now < coupon.startDate) {
//     return next(new AppError("Coupon is not valid yet", 400));
//   }
//   if (coupon.endDate && now > coupon.endDate) {
//     return next(new AppError("Coupon has expired", 400));
//   }

//   const usedCoupons = await UserPlan.countDocuments({
//     cupon: coupon._id,
//     status: { $ne: "Initiated" },
//   });

//   if (coupon.noOfTimes && usedCoupons >= coupon.noOfTimes) {
//     return next(new AppError("Coupon usage limit reached", 400));
//   }

//   if (coupon.minOrderValue && userPlan.commitedAmount < coupon.minOrderValue) {
//     return next(new AppError("Plan does not meet the minimum order value", 400));
//   }

//   if (coupon.maxDiscountValue && userPlan.commitedAmount > coupon.maxDiscountValue) {
//     return next(new AppError("Plan exceeds the maximum order value for this coupon", 400));
//   }

//   let discountValue;
//   if (coupon.type === "fixed") {
//     discountValue = coupon.value;
//   } else if (coupon.type === "percentage") {
//     discountValue = (userPlan.commitedAmount * coupon.value) / 100;
//     if (coupon.maxDiscountValue) {
//       discountValue = Math.min(discountValue, coupon.maxDiscountValue);
//     }
//   }

//   const amountAfterDiscount = userPlan.commitedAmount - discountValue;

//   userPlan.cupon = coupon._id;
//   userPlan.cuponValue = discountValue;
//   userPlan.amountAfterDiscount = amountAfterDiscount;
//   userPlan.overAllBenefits = discountValue;

//   await userPlan.save();

//   const emiList = await EmiList.findOne({ userPlan: userPlanId });
//   if (emiList) {
//     emiList.emiList[0].monthlyAdvance = amountAfterDiscount;
//     await emiList.save();
//   }

//   res.status(200).json({
//     status: true,
//     message: "Coupon applied successfully",
//   });
// });
