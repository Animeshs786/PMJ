const Exhibition = require("../../../models/exhibition");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.deleteExhibition = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const exhibition = await Exhibition.findById(id);

  if (!exhibition) {
    return res
      .status(404)
      .json({ status: false, message: "Exhibition not found" });
  }

  if (exhibition.file) {
    await deleteOldFiles(exhibition.file).catch(() => {});
  }

  await exhibition.deleteOne();

  res.status(200).json({
    status: true,
    message: "Exhibition deleted successfully",
  });
});
