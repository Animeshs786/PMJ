const axios = require("axios");
const catchAsync = require("../../../utils/catchAsync");

exports.getLocationByPincode = catchAsync(async (req, res) => {
  const { pincode } = req.query; 
  const googleApiKey = "AIzaSyAHPIRjWRQCrW60Gy6C8eSdGBXBYTv3UTA";

  if (!pincode) {
    return res.status(400).json({
      status: false,
      message: "Pincode is required",
    });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${googleApiKey}`
    );
    if (response.data.status !== "OK") {
      return res.status(404).json({
        status: false,
        message: "Location not found",
        data: {
          googleStatus: response.data.status,
        },
      });
    }

    const result = response.data.results[0];
    const addressComponents = result.address_components;

    // Extract required fields
    const country = addressComponents.find(comp => comp.types.includes("country"))?.long_name || null;
    const countryIso = addressComponents.find(comp => comp.types.includes("country"))?.short_name || null;
    const state = addressComponents.find(comp => comp.types.includes("administrative_area_level_1"))?.long_name || null;
    const stateIso = addressComponents.find(comp => comp.types.includes("administrative_area_level_1"))?.short_name || null;
    const city = addressComponents.find(comp => comp.types.includes("locality"))?.long_name ||
                 addressComponents.find(comp => comp.types.includes("administrative_area_level_3"))?.long_name || null;
    const formattedAddress = result.formatted_address || null;

    // Return the formatted response
    res.status(200).json({
      status: true,
      message: "Location retrieved successfully",
      data: {
        country,
        state,
        city,
        countryIso,
        stateIso,
        address: formattedAddress,
        
      },
    });
  } catch (error) {
    console.error("Error fetching location:", error.message);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

