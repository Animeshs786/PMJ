const Seasonal = require("../../../models/seasonal");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.updateSeasonal = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, isActive } = req.body;
  let filePath;

  try {
    const exhibition = await Seasonal.findById(id);

    if (!exhibition) {
      return res
        .status(404)
        .json({ status: false, message: "Seasonal not found" });
    }

    if (req.files && req.files.file) {
      filePath = `${req.files.file[0].destination}/${req.files.file[0].filename}`;
      if (exhibition.file)
        await deleteOldFiles(exhibition.file).catch(() => {});
      exhibition.file = filePath;
    }

    exhibition.name = name || exhibition.name;
    exhibition.isActive =
      isActive !== undefined ? isActive : exhibition.isActive;

    const updatedSeasonal = await exhibition.save();

    res.status(200).json({
      status: true,
      message: "Seasonal updated successfully",
      data: updatedSeasonal,
    });
  } catch (error) {
    if (filePath) await deleteOldFiles(filePath).catch(() => {});
    return next(error);
  }
});
