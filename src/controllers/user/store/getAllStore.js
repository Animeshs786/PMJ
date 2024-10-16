const Store = require("../../../models/store");
const catchAsync = require("../../../utils/catchAsync");
const { getDistance } = require("geolib");

exports.getAllStores = catchAsync(async (req, res) => {
  const { lat: userLat, lng: userLng } = req.user;

  let stores = await Store.find();

  stores = stores.map((store) => {
    const storeLat = parseFloat(store.lat);
    const storeLng = parseFloat(store.lng);

    const distance = getDistance(
      { latitude: userLat, longitude: userLng },
      { latitude: storeLat, longitude: storeLng }
    );

    return {
      ...store.toObject(),
      distance: distance / 1000, //distance in km
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
