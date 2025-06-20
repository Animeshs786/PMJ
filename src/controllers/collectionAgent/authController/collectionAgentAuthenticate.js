const jwt = require("jsonwebtoken");

const AppError = require("../../../utils/AppError");
const catchAsync = require("../../../utils/catchAsync");
const CollectionAgent = require("../../../models/collectionAgent");

exports.CollectionAgentAuthenticate = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookie?.sfvbexamstons) {
    token = req.cookie?.sfvbexamstons;
  }

  if (!token) {
    return next(new AppError("You are not logedin.", 404));
  }

  // token verify
  const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

  //Step3. check user not removed
  const user = await CollectionAgent.findById(decoded.id);
  if (!user) {
    return next(new AppError("Collection Agent does not exist.", 404));
  }

  req.user = user;
  next();
});
