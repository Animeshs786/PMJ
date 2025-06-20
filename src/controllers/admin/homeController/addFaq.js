const Home = require("../../../models/home");

exports.addFaq = async (req, res, next) => {
  try {
    const home = await Home.findById("6710dd8c443f484196bc5fb0");
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
