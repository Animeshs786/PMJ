const Contest = require("../../../models/contest");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.updateContest = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, isActive } = req.body;
  let filePath;

  try {
    const exhibition = await Contest.findById(id);

    if (!exhibition) {
      return res
        .status(404)
        .json({ status: false, message: "Contest not found" });
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

    const updatedContest = await exhibition.save();

    res.status(200).json({
      status: true,
      message: "Contest updated successfully",
      data: updatedContest,
    });
  } catch (error) {
    if (filePath) await deleteOldFiles(filePath).catch(() => {});
    return next(error);
  }
});
