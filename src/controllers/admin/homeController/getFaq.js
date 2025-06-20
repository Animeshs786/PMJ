const Home = require("../../../models/home");

exports.getFaq = async (req, res, next) => {
  try {
    const faqId = req.params.id;
    const home = await Home.findById("6710dd8c443f484196bc5fb0");

    if (!home) {
      return res.status(404).json({
        status: false,
        message: "Home document not found",
      });
    }

    const faq = home.faq.id(faqId);

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
