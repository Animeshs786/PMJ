const PlanDock = require("../../../models/planDock");
const catchAsync = require("../../../utils/catchAsync");

exports.getDockDetail = catchAsync(async (req, res) => {
  const { id } = req.query;

  const emiList = await PlanDock.findById(id);

  res.status(200).json({
    status: true,
    message: "Plans Dock retrieved successfully.",
    data: emiList,
  });
});
