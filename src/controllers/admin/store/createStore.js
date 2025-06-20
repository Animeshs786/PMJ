const Store = require("../../../models/store"); // Adjust the path as necessary
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

// Create a new store with image upload
exports.createStore = catchAsync(async (req, res, next) => {
  const {
    address,
    fullAddress,
    mobileNumber,
    openTime,
    closeTime,
    lat,
    lng,
    pincode,
    state,
    city,
    location
  } = req.body;

  if(!address) return next(new AppError("Please provide address.", 400));
  if(!fullAddress) return next(new AppError("Please provide fullAddress.", 400));
  if(!mobileNumber) return next(new AppError("Please provide mobileNumber.", 400));
  if(!openTime) return next(new AppError("Please provide openTime.", 400));
  if(!closeTime) return next(new AppError("Please provide closeTime.", 400));
  if(!pincode) return next(new AppError("Please provide pincode.", 400));
  if(!state) return next(new AppError("Please provide state.", 400));
  // if(!city) return next(new AppError("Please provide city.", 400));


  let images;

  if (req.files && req.files.image) {
    images = req.files?.image?.map(
      (file) => `${file.destination}/${file.filename}`
    );
  }

  const newStore = await Store.create({
    address,
    fullAddress,
    mobileNumber,
    openTime,
    closeTime,
    image: images,
    lat,
    lng,
    pincode,
    state,
    city,
    location
  });

  res.status(201).json({
    status: true,
    data: {
      store: newStore,
    },
  });
});
