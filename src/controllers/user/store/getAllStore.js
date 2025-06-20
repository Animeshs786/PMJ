const Store = require("../../../models/store");
const catchAsync = require("../../../utils/catchAsync");
const { getDistance } = require("geolib");

exports.getAllStores = catchAsync(async (req, res) => {
  const { lat: userLat, lng: userLng } = req.user;
  const { search } = req.query;

  let filter = {};

  if (search) {
    const searchRegex = new RegExp(search, "i");

    filter = {
      $or: [
        { state: { $regex: searchRegex } },
        { city: { $regex: searchRegex } },
        { address: { $regex: searchRegex } },
        { fullAddress: { $regex: searchRegex } },
        ...(isNaN(search) ? [] : [{ pincode: parseInt(search) }]),
      ],
    };
  }

  let stores = await Store.find(filter);

  stores = stores.map((store) => {
    const storeLat = parseFloat(store.lat);
    const storeLng = parseFloat(store.lng);

    const distance = getDistance(
      { latitude: userLat, longitude: userLng },
      { latitude: storeLat, longitude: storeLng }
    );

    return {
      ...store.toObject(),
      distance: distance / 1000,
    };
  });

  stores.sort((a, b) => a.distance - b.distance);

  res.status(200).json({
    status: true,
    results: stores.length,
    data: {
      stores,
    },
  });
});
