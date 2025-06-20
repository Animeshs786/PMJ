
const Seasonal = require("../../../models/seasonal");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.deleteSeasonal = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const exhibition = await Seasonal.findById(id);

  if (!exhibition) {
    return res
      .status(404)
      .json({ status: false, message: "Seasonal not found" });
  }

  if (exhibition.file) {
    await deleteOldFiles(exhibition.file).catch(() => {});
  }

  await exhibition.deleteOne();

  res.status(200).json({
    status: true,
    message: "Seasonal deleted successfully",
  });
});
