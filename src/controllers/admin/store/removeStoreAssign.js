const StoreAssign = require("../../../models/storeAssign");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const mongoose = require("mongoose");

const removeStoreAssignment = catchAsync(async (req, res, next) => {
  const { store, salePerson, collectionAgent } = req.body;

  // Validate store ID
  if (!store || !mongoose.Types.ObjectId.isValid(store)) {
    return next(new AppError("Invalid or missing store ID.", 400));
  }

  // Find the existing store assignment document
  const storeAssign = await StoreAssign.findOne({ store });

  // If no store assignment exists, return an error
  if (!storeAssign) {
    return next(new AppError("No store assignment found for the provided store ID.", 404));
  }

  // Handle salePerson removal
  if (salePerson) {
    if (!mongoose.Types.ObjectId.isValid(salePerson)) {
      return next(new AppError("Invalid salePerson ID.", 400));
    }
    const salePersonIndex = storeAssign.salePerson.indexOf(salePerson);
    if (salePersonIndex !== -1) {
      storeAssign.salePerson.splice(salePersonIndex, 1);
    }
  }

  // Handle collectionAgent removal
  if (collectionAgent) {
    if (!mongoose.Types.ObjectId.isValid(collectionAgent)) {
      return next(new AppError("Invalid collectionAgent ID.", 400));
    }
    const collectionAgentIndex = storeAssign.collectionAgent.indexOf(collectionAgent);
    if (collectionAgentIndex !== -1) {
      storeAssign.collectionAgent.splice(collectionAgentIndex, 1);
    }
  }

  // Remove duplicates (though unlikely after removal)
  storeAssign.salePerson = [...new Set(storeAssign.salePerson)];
  storeAssign.collectionAgent = [...new Set(storeAssign.collectionAgent)];

  // Save the updated store assignment
  await storeAssign.save();

  res.status(200).json({
    status: true,
    message: "Store assignment updated successfully.",
    data: storeAssign,
  });
});

module.exports = removeStoreAssignment;