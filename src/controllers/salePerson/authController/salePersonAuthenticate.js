const jwt = require("jsonwebtoken");

const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const SalePerson = require("../../../models/salePerson");

exports.salePersonAuthenticate = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookie?.xcvbexamstons) {
    token = req.cookie?.xcvbexamstons;
  }

  if (!token) {
    return next(new AppError("You are not logedin.", 404));
  }

  // token verify
  const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

  //Step3. check user not removed
  const user = await SalePerson.findById(decoded.id);
  if (!user) {
    return next(new AppError("Sale Person does not exist.", 404));
  }

  //Step4. check password update
  // if (await user.validatePasswordUpdate(decoded.iat)) {
  //   return next(new AppError("Password updated login again.", 404));
  // }

  req.user = user;
  next();
});
