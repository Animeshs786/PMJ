const Rating = require("../../../models/ratting");
const UserPlan = require("../../../models/userPlan");
const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");

exports.createRating = catchAsync(async (req, res, next) => {
  const { rating, userPlan, message } = req.body;
  const userId = req.user._id;
  console.log(userPlan, userId);

  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError("Rating must be a number between 1 and 5", 400));
  }

  // const userPlanRecord = await UserPlan.findOne({
  //   _id: userPlan,
  //   user: userId,
  // });
  // if (!userPlanRecord) {
  //   return next(
  //     new AppError("Invalid UserPlan or not associated with this user", 400)
  //   );
  // }

  // const existingRating = await Rating.findOne({ user: userId, userPlan });
  // if (existingRating) {
  //   return next(new AppError("You have already rated this plan", 400));
  // }

  const newRating = await Rating.create({
    rating,
    user: userId,
    userPlan,
    message,
  });

  res.status(201).json({
    status: true,
    message: "Rating created successfully",
    data: newRating,
  });
});
