const { isValidObjectId } = require("mongoose");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const User = require("../../../models/user");
const deleteOldFiles = require("../../../utils/deleteOldFiles");
const Plan = require("../../../models/plan");
const PlanDock = require("../../../models/planDock");

exports.createPlanDock = catchAsync(async (req, res, next) => {
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
  const id = req.user._id;

  if (!isValidObjectId(id)) {
    return next(new AppError("Invalid user ID", 400));
  }
  const obj = { user: id };

  // Check if email already exists for another user
  if (email) {
    const user = await User.findOne({ email: email, _id: { $ne: id } });
    if (user) {
      return next(new AppError("Email already exists", 400));
    }
  }

  if(mobile){
    const user = await User.findOne({ mobile: mobile, _id: { $ne: id } });
    if (user) {
      return next(new AppError("Mobile already exists", 400));
    }
  }

  if (!plan) {
    return next(new AppError("Please select a plan", 400));
  }

  if (plan) {
    const planData = await Plan.findById(plan);
    if (!planData) {
      return next(new AppError("Plan not found", 400));
    }
  }

  // Assign provided fields to the object for updating
  if (name) obj.name = name;
  if (plan) obj.plan = plan;
  if (panId) obj.panId = panId;
  if (email) obj.email = email;
  if (salePersonId) obj.salePersonId = salePersonId;
  if (dob) obj.dob = dob;
  if (gender) obj.gender = gender;
  if (city) obj.city = city;
  if (state) obj.state = state;
  if (pincode) obj.pincode = pincode;
  if (country) obj.country = country;
  if (nomineeName) obj.nomineeName = nomineeName;
  if (nomineeRelation) obj.nomineeRelation = nomineeRelation;
  if (refferalCode) obj.refferalCode = refferalCode;
  if (bankName) obj.bankName = bankName;
  if (ifscCode) obj.ifscCode = ifscCode;
  if (branchName) obj.branchName = branchName;
  if (accountNumber) obj.accountNumber = accountNumber;
  if (customerName) obj.customerName = customerName;
  if (mobile) obj.mobile = mobile;

  // Billing Address
  if (billingAddress1) obj.billingAddress1 = billingAddress1;
  if (billingAddress2) obj.billingAddress2 = billingAddress2;
  if (billingPincode) obj.billingPincode = billingPincode;
  if (billingCountry) obj.billingCountry = billingCountry;
  if (billingState) obj.billingState = billingState;
  if (billingCity) obj.billingCity = billingCity;

  // Shipping Address
  if (shippingAddress1) obj.shippingAddress1 = shippingAddress1;
  if (shippingAddress2) obj.shippingAddress2 = shippingAddress2;
  if (shippingPincode) obj.shippingPincode = shippingPincode;
  if (shippingCountry) obj.shippingCountry = shippingCountry;
  if (shippingState) obj.shippingState = shippingState;
  if (shippingCity) obj.shippingCity = shippingCity;

  // Additional fields
  if (maritalStatus) obj.maritalStatus = maritalStatus;
  if (aniversaryDate) obj.aniversaryDate = aniversaryDate;
  if (schemeCustomer) obj.schemeCustomer = schemeCustomer;
  if (citizenship) obj.citizenship = citizenship;

  let panImagePath,
    adharImagePath,
    gurdianProofPath,
    governmentIdProofPath,
    form60Path;
  try {
    if (req.files) {
      if (req.files.panImage) {
        const panImageUrls = req.files.panImage.map(
          (file) => `${file.destination}/${file.filename}`
        );
        obj.panImage = panImageUrls;
        panImagePath = panImageUrls;
      }
      if (req.files.adharImage) {
        const adharImageUrls = req.files.adharImage.map(
          (file) => `${file.destination}/${file.filename}`
        );
        obj.adharImage = adharImageUrls;
        adharImagePath = adharImageUrls;
      }
      if (req.files.gurdianProofImage) {
        const gurdianProofUrls = req.files.gurdianProofImage.map(
          (file) => `${file.destination}/${file.filename}`
        );
        obj.gurdianProofImage = gurdianProofUrls;
        gurdianProofPath = gurdianProofUrls;
      }
      if (req.files.governmentIdProofImage) {
        const governmentIdProofUrls = req.files.governmentIdProofImage.map(
          (file) => `${file.destination}/${file.filename}`
        );
        obj.governmentIdProofImage = governmentIdProofUrls;
        governmentIdProofPath = governmentIdProofUrls;
      }
      if (req.files.form60Image) {
        const form60Urls = req.files.form60Image.map(
          (file) => `${file.destination}/${file.filename}`
        );
        obj.form60Image = form60Urls;
        form60Path = form60Urls;
      }
    }

    // Update user profile in the database
    const planDock = await PlanDock.create(obj);

    return res.status(200).json({
      status: true,
      message: "Document upload successfully",
      data: planDock,
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

