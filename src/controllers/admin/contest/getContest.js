const Contest = require("../../../models/contest");
const catchAsync = require("../../../utils/catchAsync");

exports.getContest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const exhibition = await Contest.findById(id);

  if (!exhibition) {
    return res
      .status(404)
      .json({ status: false, message: "Seasonal not found" });
  }

  res.status(200).json({
    status: true,
    message: "Seasonal fetched successfully",
    data: exhibition,
  });
});
