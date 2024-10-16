const Refferal = require("../models/refferal");
const Admin = require("../models/admin");

const generateRefferal = async ({
  userId,
  item,
  onModel,
  referralCode,
  isView = false,
  isPurchased = false,
}) => {
  const refferedUser = await Admin.findOne({ referralCode }).select("id");

  if (refferedUser?.id) {
    let refferalData = await Refferal.findOne({
      referrer: refferedUser.id,
      referredUser: userId,
      item,
      onModel,
      isView,
    });

    if (!refferalData) {
      refferalData = await Refferal.create({
        referrer: refferedUser.id,
        referredUser: userId,
        item,
        onModel,
        isView,
        isPurchased,
      });
      return;
    }

    refferalData.isView = isView;
    refferalData.isPurchased = isPurchased;
    await refferalData.save();
  }
};

module.exports = generateRefferal;
