const Home = require("../../../models/home");
const catchAsync = require("../../../utils/catchAsync");

exports.getHome = catchAsync(async (req, res) => {
  const home = await Home.findById("6707c53a47953ec0f4270050");
  res.status(200).json({
    status: true,
    message: "Home data fetched successfully",
    data: {
      home,
    },
  });
});
