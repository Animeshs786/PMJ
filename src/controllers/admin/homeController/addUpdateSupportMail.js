const Home = require("../../../models/home");

exports.addUpdateSupportMail = async (req, res, next) => {
  try {
    const home = await Home.findById("6710dd8c443f484196bc5fb0");
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
