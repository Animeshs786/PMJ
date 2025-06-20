const GoldExchange = require("../../../models/goldExchange");
const Share = require("../../../models/share");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllGoldQueryCount = catchAsync(async (req, res, next) => {
  const { _id: salePersonId } = req.user;
  if (!salePersonId) {
    return res.status(400).json({
      status: false,
      message: "Sale Person ID is required.",
    });
  }

  const {
    search,
    startDate,
    endDate,

    status,
  } = req.query;

  const sharedUsers = await Share.find({ salePerson: salePersonId }).select(
    "mobile"
  );

  if (!sharedUsers.length) {
    return res.status(200).json({
      status: true,
      data: {
        service: 0,
      },
    });
  }

  const sharedMobileNumbers = sharedUsers.map((share) => share.mobile);

  const filter = { mobileNumber: { $in: sharedMobileNumbers }, isView: false };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (status) {
    filter.status = status;
  }
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  const services = await GoldExchange.countDocuments(filter);

  res.status(200).json({
    status: true,
    data: {
      service: services,
    },
  });
});
