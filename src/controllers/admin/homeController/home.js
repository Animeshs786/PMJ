const Home = require("../../../models/home");
const catchAsync = require("../../../utils/catchAsync");

exports.homeController = catchAsync(async (req, res) => {
  const {
    aboutUs,
    aboutUsDetails,
    privacyPolicy,
    privacyPolicyDetails,
    termCondition,
    termConditionDetails,
    id="6710dd8c443f484196bc5fb0",
  } = req.body;

  const updateData = {};

  if (aboutUs) updateData.aboutUs = aboutUs;
  if (aboutUsDetails) updateData.aboutUsDetails = aboutUsDetails;
  if (privacyPolicy) updateData.privacyPolicy = privacyPolicy;
  if (privacyPolicyDetails)
    updateData.privacyPolicyDetails = privacyPolicyDetails;
  if (termCondition) updateData.termCondition = termCondition;
  if (termConditionDetails)
    updateData.termConditionDetails = termConditionDetails;

  let home;
  if (!id) {
    home = await Home.create({
      aboutUs,
      aboutUsDetails,
      privacyPolicy,
      privacyPolicyDetails,
      termCondition,
      termConditionDetails,
    });
  }

  if (id) {
    home = await Home.findByIdAndUpdate(id, updateData, { new: true });
  }

  res.status(200).json({
    success: true,
    message: "Home data updated successfully",
    data: { home },
  });
});
