const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

exports.getPlanStatements = catchAsync(async (req, res) => {
  const { planId } = req.body;

  const emiList = await EmiList.findOne({
    userPlan: planId,
  });

  res.status(200).json({
    status: true,
    message: "Plans statements retrieved successfully.",
    data: emiList,
  });
});
