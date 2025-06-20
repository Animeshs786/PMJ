const Contest = require("../../../models/contest");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.createContest = catchAsync(async (req, res, next) => {
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

    const newExhibition = await Contest.create(exhibitionData);

    res.status(201).json({
      status: true,
      message: "Contest created successfully",
      seasonal: newExhibition,
    });
  } catch (error) {
    if (filePath) await deleteOldFiles(filePath).catch(() => {});
    return next(error);
  }
});
