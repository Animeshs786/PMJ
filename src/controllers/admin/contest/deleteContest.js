const Contest = require("../../../models/contest");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.deleteContest = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const exhibition = await Contest.findById(id);

  if (!exhibition) {
    return res
      .status(404)
      .json({ status: false, message: "Contest not found" });
  }

  if (exhibition.file) {
    await deleteOldFiles(exhibition.file).catch(() => {});
  }

  await exhibition.deleteOne();

  res.status(200).json({
    status: true,
    message: "Contest deleted successfully",
  });
});
