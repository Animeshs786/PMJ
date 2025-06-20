const { Country } = require("country-state-city");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllCountries = catchAsync(async (req, res) => {
  // Get all countries
  const countries = Country.getAllCountries();

  res.status(200).json({
    status: true,
    message: "Countries retrieved successfully",
    data: {
      countries,
    },
  });
});

