const EmiList = require("../../../models/emiList");
const catchAsync = require("../../../utils/catchAsync");

exports.getPlanStatements = catchAsync(async (req, res) => {
  const { userPlan } = req.query;

  const emiList = await EmiList.findOne({
    userPlan: userPlan,
  });

  res.status(200).json({
    status: true,
    message: "Plans statements retrieved successfully.",
    data: emiList,
  });
});
