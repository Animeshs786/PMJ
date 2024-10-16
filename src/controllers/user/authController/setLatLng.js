const User = require("../../../models/user");
const catchAsync = require("../../../utils/catchAsync");

exports.setLatLng = catchAsync(async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(userId, { lat, lng });

  res.status(200).json({
    status: true,
    data: user,
  });
});
