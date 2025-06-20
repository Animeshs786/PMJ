const CollectionAgentMobile = require("../../../models/collectionAgentMobile");
const catchAsync = require("../../../utils/catchAsync");

const getAllCollectionAgentMobiles = catchAsync(async (req, res) => {
  const collectionAgentMobiles = await CollectionAgentMobile.find();

  res.status(200).json({
    status: true,
    message: "Collection agent mobiles fetched successfully.",
    data: collectionAgentMobiles,
  });
});

module.exports = getAllCollectionAgentMobiles;