const UserPlan = require("../../../models/userPlan");
const catchAsync = require("../../../utils/catchAsync");
const AppError = require("../../../utils/AppError");

exports.getClosePlan = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const userPlans = await UserPlan.find({
        user: userId,
        status: { $in: ["Completed", "Forclosed"] },
    })
        .populate("plan", "name")
        .sort("-createdAt");

    if (!userPlans || userPlans.length === 0) {
        return next(new AppError("No completed or forclosed plans found for this user", 404));
    }

    res.status(200).json({
        status: true,
        message: "Plans fetched successfully.",
        data: userPlans,
    });
});