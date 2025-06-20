const Contest = require("../../../models/contest");
const catchAsync = require("../../../utils/catchAsync");

exports.getContest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const exhibition = await Contest.findById(id);

  if (!exhibition) {
    return res
      .status(404)
      .json({ status: false, message: "Contest not found" });
  }

  res.status(200).json({
    status: true,
    message: "Contest fetched successfully",
    data: exhibition,
  });
});
