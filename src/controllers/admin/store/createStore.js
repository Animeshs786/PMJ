const Store = require("../../../models/store"); // Adjust the path as necessary
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

// Create a new store with image upload
exports.createStore = catchAsync(async (req, res, next) => {
  const { address, fullAddress, mobileNumber, openTime, closeTime, lat, lng } =
    req.body;

  if (!address || !fullAddress || !mobileNumber || !openTime || !closeTime) {
    return next(new AppError("Please provide all the required fields", 400));
  }

  const images = req.files.image.map(
    (file) => `${file.destination}/${file.filename}`
  );

  const newStore = await Store.create({
    address,
    fullAddress,
    mobileNumber,
    openTime,
    closeTime,
    image: images,
    lat,
    lng,
  });

  res.status(201).json({
    status: true,
    data: {
      store: newStore,
    },
  });
});
