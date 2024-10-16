const Home = require("../../../models/home");

exports.deleteFaq = async (req, res, next) => {
  try {
    const home = await Home.findById("6707c53a47953ec0f4270050");
    home.faq.pull(req.body.faqId);
    await home.save();

    res.status(200).json({
      status: true,
      message: "Faq delete successfully",
    });
  } catch (err) {
    next(err);
  }
};
