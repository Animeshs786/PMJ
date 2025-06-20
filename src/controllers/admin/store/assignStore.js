const StoreAssign = require("../../../models/storeAssign");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

const assignStore = catchAsync(async (req, res, next) => {
  const { store, salePerson, collectionAgent } = req.body;

  // Find the existing store assignment document
  let storeAssign = await StoreAssign.findOne({ store });

  // If no store assignment exists, create a new one
  if (!storeAssign) {
    storeAssign = await StoreAssign.create({
      store,
      salePerson: [],
      collectionAgent: [],
    });
  }

  // Handle salePerson assignment/unassignment
  if (salePerson) {
    const salePersonIndex = storeAssign.salePerson.indexOf(salePerson);

    if (salePersonIndex === -1) {
      // If salePerson is not present, add them
      storeAssign.salePerson.push(salePerson);
    } else {
      // If salePerson is present, remove them
      storeAssign.salePerson.splice(salePersonIndex, 1);
    }
  }

  // Handle collectionAgent assignment/unassignment
  if (collectionAgent) {
    const collectionAgentIndex =
      storeAssign.collectionAgent.indexOf(collectionAgent);

    if (collectionAgentIndex === -1) {
      // If collectionAgent is not present, add them
      storeAssign.collectionAgent.push(collectionAgent);
    } else {
      // If collectionAgent is present, remove them
      storeAssign.collectionAgent.splice(collectionAgentIndex, 1);
    }
  }

  // Remove duplicate IDs from salePerson and collectionAgent arrays
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

module.exports = assignStore;
