const Store = require("../../../models/store");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.deleteStore = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const store = await Store.findByIdAndDelete(id);

  if (!store) {
    return next(new AppError("No store found with that ID", 404));
  }

  await deleteOldFiles(store.image).catch((err) => {
    console.error("Failed to delete images:", err);
  });

  res.status(200).json({
    status: true,
    message: "Store delete successfully.",
  });
});
