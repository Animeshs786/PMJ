const Service = require("../../../models/service");
const Share = require("../../../models/share");
const catchAsync = require("../../../utils/catchAsync");

exports.getAllServiceCount = catchAsync(async (req, res, next) => {
  const { _id: salePersonId } = req.user;
  if (!salePersonId) {
    return res.status(400).json({
      status: false,
      message: "Sale Person ID is required.",
    });
  }

  const { search, startDate, endDate, status } = req.query;

  const sharedUsers = await Share.find({ salePerson: salePersonId }).select("mobile");

  if (!sharedUsers.length) {
    return res.status(200).json({
      status: true,
      data: {
        service: 0,
      },
    });
  }

  const sharedMobileNumbers = sharedUsers.map((share) => share.mobile);

  // Base filter with isView: false
  const filter = { mobileNumber: { $in: sharedMobileNumbers }, isView: false };

  // Add search filter
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // Add status filter
  if (status) {
    filter.status = status;
  }

  // Add date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.createdAt.$lte = new Date(endDate);
    }
  }

  // Count documents based on the filter
  const services = await Service.countDocuments(filter);

  res.status(200).json({
    status: true,
    data: {
      service: services,
    },
  });
});