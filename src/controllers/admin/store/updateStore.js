const Store = require("../../../models/store");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.updateStore = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
  
    const store = await Store.findById(id);
    if (!store) {
      return next(new AppError("No store found with that ID", 404));
    }
  
    if (req.files && req.files.image) {
      const oldImages = store.image;
      const newImages = req.files.image.map(file => `${file.destination}/${file.filename}`);
      updateData.image = newImages;
  
      await deleteOldFiles(oldImages).catch((err) => {
        console.error("Failed to delete old images:", err);
      });
    }
  
    const updatedStore = await Store.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  
    res.status(200).json({
      status: true,
      data: {
        store: updatedStore,
      },
    });
  });