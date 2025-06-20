const { isValidObjectId } = require("mongoose");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");
const User = require("../../../models/user");
const deleteOldFiles = require("../../../utils/deleteOldFiles");

exports.updateUser = catchAsync(async (req, res, next) => {
  const { name, email, dob, city, state, pincode, country, gender } = req.body;
  const obj = {};
  const id = req.params.id;

  if (!isValidObjectId(id)) {
    return next(new AppError("Invalid user ID", 400));
  }

  if (email) {
    const user = await User.findOne({ email: email, _id: { $ne: id } });
    if (user) {
      return next(new AppError("Email already exists", 400));
    }
  }

  if (name) obj.name = name;
  if (email) obj.email = email;
  if (dob) obj.dob = dob;
  if (city) obj.city = city;
  if (state) obj.state = state;
  if (pincode) obj.pincode = pincode;
  if (country) obj.country = country;
  if (gender) obj.gender = gender;

  let profileImagePath;

  try {
    if (req.files && req.files.profileImage) {
      const url = `${req.files.profileImage[0].destination}/${req.files.profileImage[0].filename}`;
      obj.profileImage = url;
      profileImagePath = url;
    }

    const updatedUser = await User.findByIdAndUpdate(id, obj, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (profileImagePath) {
      await deleteOldFiles(profileImagePath).catch((err) => {
        console.error("Failed to delete profile image:", err);
      });
    }
    return next(error);
  }
});
