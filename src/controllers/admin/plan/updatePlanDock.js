const { isValidObjectId } = require("mongoose");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const User = require("../../../models/user");
const deleteOldFiles = require("../../../utils/deleteOldFiles");
const Plan = require("../../../models/plan");
const PlanDock = require("../../../models/planDock");

exports.updatePlanDock = catchAsync(async (req, res, next) => {
  const {
    name,
    plan,
    email,
    dob,
    gender,
    city,
    state,
    pincode,
    country,
    nomineeName,
    nomineeRelation,
    refferalCode,
    bankName,
    ifscCode,
    branchName,
    accountNumber,
    customerName,
    billingAddress1,
    billingAddress2,
    billingPincode,
    billingCountry,
    billingState,
    billingCity,
    shippingAddress1,
    shippingAddress2,
    shippingPincode,
    shippingCountry,
    shippingState,
    shippingCity,
    maritalStatus,
    aniversaryDate,
    schemeCustomer,
    citizenship,
    panId,
    mobile,
    salePersonId,
  } = req.body;

  const { id } = req.params; // PlanDock ID to update

  if (!isValidObjectId(id)) {
    return next(new AppError("Invalid PlanDock ID", 400));
  }

  // Find the PlanDock document to update
  const planDock = await PlanDock.findById(id);
  if (!planDock) {
    return next(new AppError("PlanDock not found", 404));
  }

  // Check if email already exists for another user
  if (email) {
    const user = await User.findOne({ email: email, _id: { $ne: planDock.user } });
    if (user) {
      return next(new AppError("Email already exists", 400));
    }
  }

  // Check if mobile already exists for another user
  if (mobile) {
    const user = await User.findOne({ mobile: mobile, _id: { $ne: planDock.user } });
    if (user) {
      return next(new AppError("Mobile already exists", 400));
    }
  }

  // Validate the plan if provided
  if (plan) {
    const planData = await Plan.findById(plan);
    if (!planData) {
      return next(new AppError("Plan not found", 400));
    }
  }

  // Create an object to store updated fields
  const updateObj = {};

  // Assign provided fields to the update object
  if (name) updateObj.name = name;
  if (plan) updateObj.plan = plan;
  if (panId) updateObj.panId = panId;
  if (email) updateObj.email = email;
  if (salePersonId) updateObj.salePersonId = salePersonId;
  if (dob) updateObj.dob = dob;
  if (gender) updateObj.gender = gender;
  if (city) updateObj.city = city;
  if (state) updateObj.state = state;
  if (pincode) updateObj.pincode = pincode;
  if (country) updateObj.country = country;
  if (nomineeName) updateObj.nomineeName = nomineeName;
  if (nomineeRelation) updateObj.nomineeRelation = nomineeRelation;
  if (refferalCode) updateObj.refferalCode = refferalCode;
  if (bankName) updateObj.bankName = bankName;
  if (ifscCode) updateObj.ifscCode = ifscCode;
  if (branchName) updateObj.branchName = branchName;
  if (accountNumber) updateObj.accountNumber = accountNumber;
  if (customerName) updateObj.customerName = customerName;
  if (mobile) updateObj.mobile = mobile;

  // Billing Address
  if (billingAddress1) updateObj.billingAddress1 = billingAddress1;
  if (billingAddress2) updateObj.billingAddress2 = billingAddress2;
  if (billingPincode) updateObj.billingPincode = billingPincode;
  if (billingCountry) updateObj.billingCountry = billingCountry;
  if (billingState) updateObj.billingState = billingState;
  if (billingCity) updateObj.billingCity = billingCity;

  // Shipping Address
  if (shippingAddress1) updateObj.shippingAddress1 = shippingAddress1;
  if (shippingAddress2) updateObj.shippingAddress2 = shippingAddress2;
  if (shippingPincode) updateObj.shippingPincode = shippingPincode;
  if (shippingCountry) updateObj.shippingCountry = shippingCountry;
  if (shippingState) updateObj.shippingState = shippingState;
  if (shippingCity) updateObj.shippingCity = shippingCity;

  // Additional fields
  if (maritalStatus) updateObj.maritalStatus = maritalStatus;
  if (aniversaryDate) updateObj.aniversaryDate = aniversaryDate;
  if (schemeCustomer) updateObj.schemeCustomer = schemeCustomer;
  if (citizenship) updateObj.citizenship = citizenship;

  let panImagePath,
    adharImagePath,
    gurdianProofPath,
    governmentIdProofPath,
    form60Path;

  try {
    if (req.files) {
      // Handle file uploads and update paths
      if (req.files.panImage) {
        const panImageUrls = req.files.panImage.map(
          (file) => `${file.destination}/${file.filename}`
        );
        updateObj.panImage = panImageUrls;
        panImagePath = panImageUrls;
      }
      if (req.files.adharImage) {
        const adharImageUrls = req.files.adharImage.map(
          (file) => `${file.destination}/${file.filename}`
        );
        updateObj.adharImage = adharImageUrls;
        adharImagePath = adharImageUrls;
      }
      if (req.files.gurdianProofImage) {
        const gurdianProofUrls = req.files.gurdianProofImage.map(
          (file) => `${file.destination}/${file.filename}`
        );
        updateObj.gurdianProofImage = gurdianProofUrls;
        gurdianProofPath = gurdianProofUrls;
      }
      if (req.files.governmentIdProofImage) {
        const governmentIdProofUrls = req.files.governmentIdProofImage.map(
          (file) => `${file.destination}/${file.filename}`
        );
        updateObj.governmentIdProofImage = governmentIdProofUrls;
        governmentIdProofPath = governmentIdProofUrls;
      }
      if (req.files.form60Image) {
        const form60Urls = req.files.form60Image.map(
          (file) => `${file.destination}/${file.filename}`
        );
        updateObj.form60Image = form60Urls;
        form60Path = form60Urls;
      }
    }

    // Update the PlanDock document
    const updatedPlanDock = await PlanDock.findByIdAndUpdate(id, updateObj, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
    });

    if (!updatedPlanDock) {
      return next(new AppError("PlanDock not found", 404));
    }

    return res.status(200).json({
      status: true,
      message: "PlanDock updated successfully",
      data: updatedPlanDock,
    });
  } catch (error) {
    // Delete the uploaded files if there was an error during update
    if (panImagePath) {
      await deleteOldFiles(panImagePath).catch((err) => {
        console.error("Failed to delete PAN image:", err);
      });
    }
    if (adharImagePath) {
      await deleteOldFiles(adharImagePath).catch((err) => {
        console.error("Failed to delete Aadhaar image:", err);
      });
    }
    if (gurdianProofPath) {
      await deleteOldFiles(gurdianProofPath).catch((err) => {
        console.error("Failed to delete guardian proof image:", err);
      });
    }
    if (governmentIdProofPath) {
      await deleteOldFiles(governmentIdProofPath).catch((err) => {
        console.error("Failed to delete government ID proof image:", err);
      });
    }
    if (form60Path) {
      await deleteOldFiles(form60Path).catch((err) => {
        console.error("Failed to delete form 60 image:", err);
      });
    }
    return next(error);
  }
});