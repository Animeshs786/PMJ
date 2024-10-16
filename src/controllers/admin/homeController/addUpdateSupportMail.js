const Home = require("../../../models/home");

exports.addUpdateSupportMail = async (req, res, next) => {
  try {
    const home = await Home.findById("6707c53a47953ec0f4270050");
    home.supportMail=req.body.supportMail;
    await home.save();

    res.status(200).json({
      status: true,
      message: "Mail Update successfully",
    });
  } catch (err) {
    next(err);
  }
};
