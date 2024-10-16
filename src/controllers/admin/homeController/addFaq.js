const Home = require("../../../models/home");

exports.addFaq = async (req, res, next) => {
  try {
    const home = await Home.findById("6707c53a47953ec0f4270050");
    home.faq.push(req.body.faq);
    await home.save();

    res.status(200).json({
      status: true,
      message: "Faq added successfully",
    });
  } catch (err) {
    next(err);
  }
};
