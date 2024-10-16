const Home = require("../../../models/home");

exports.getAllFaq = async (req, res, next) => {
  try {
    const home = await Home.findById("6707c53a47953ec0f4270050");

    if (!home) {
      return res.status(404).json({
        status: false,
        message: "Home document not found",
      });
    }

    const faq = home.faq;

    if (!faq) {
      return res.status(404).json({
        status: false,
        message: "FAQ not found",
      });
    }

    res.status(200).json({
      status: true,
      data: faq,
    });
  } catch (err) {
    next(err);
  }
};
