const Exhibition = require("../../../models/exhibition");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.createExhibition = catchAsync(async (req, res, next) => {
  const { name, isActive } = req.body;
  let filePath;

  const exhibitionData = {
    name,
    isActive: isActive === undefined ? true : isActive,
  };

  try {
    if (req.files && req.files.file) {
      const uploadedFile = req.files.file[0];
      const fileUrl = `${uploadedFile.destination}/${uploadedFile.filename}`;
      exhibitionData.file = fileUrl;
      filePath = fileUrl;
    } else {
      return res
        .status(400)
        .json({ status: false, message: "File is required." });
    }

    const newExhibition = await Exhibition.create(exhibitionData);

    res.status(201).json({
      status: true,
      message: "Exhibition created successfully",
      data: newExhibition,
    });
  } catch (error) {
    if (filePath) await deleteOldFiles(filePath).catch(() => {});
    return next(error);
  }
});
