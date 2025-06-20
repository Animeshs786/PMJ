const { City } = require("country-state-city");
const catchAsync = require("../../../utils/catchAsync");

exports.getCity = catchAsync(async (req, res) => {
  const { stateCode, countryCode } = req.query;

  if (!stateCode) {
    return res.status(400).json({
      status: "fail",
      message: "State code is required",
    });
  }

  const cities = City.getCitiesOfState(countryCode, stateCode);

  if (!cities || cities.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "No cities found for the specified state code",
    });
  }

  res.status(200).json({
    status: true,
    message: "Cities retrieved successfully",
    data: {
      cities,
    },
  });
});
