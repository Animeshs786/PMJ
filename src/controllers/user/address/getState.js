const { Country, State } = require("country-state-city");
const catchAsync = require("../../../utils/catchAsync");

exports.getState = catchAsync(async (req, res) => {
  const { countryName } = req.query;

  const india = Country.getAllCountries().find(
    (country) => country.name === countryName
  );

  if (!india) {
    return res.status(404).json({
      status: "fail",
      message: `${countryName} not found in the country list`,
    });
  }

  // Get all states for India using the country code
  const states = State.getStatesOfCountry(india.isoCode);

  res.status(200).json({
    status: true,
    message: "States retrieved successfully",
    data: {
      states,
    },
  });
});
