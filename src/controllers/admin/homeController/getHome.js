const Home = require("../../../models/home");
const catchAsync = require("../../../utils/catchAsync");

exports.getHome = catchAsync(async (req, res) => {
  const home = await Home.findById("6710dd8c443f484196bc5fb0");
  res.status(200).json({
    status: true,
    message: "Home data fetched successfully",
    data: {
      home,
    },
  });
});
