const Exhibition = require("../../../models/exhibition");
const catchAsync = require("../../../utils/catchAsync");

exports.getExhibitionById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const exhibition = await Exhibition.findById(id);
  
    if (!exhibition) {
      return res.status(404).json({ status: false, message: "Exhibition not found" });
    }
  
    res.status(200).json({
      status: true,
      message: "Exhibition fetched successfully",
      data: exhibition,
    });
  });


