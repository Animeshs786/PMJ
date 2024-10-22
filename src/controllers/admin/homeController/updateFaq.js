const Home = require("../../../models/home");

exports.updateFaq = async (req, res, next) => {
  try {
    const { faqId, question, answer } = req.body;
    const home = await Home.findById("6710dd8c443f484196bc5fb0");

    const faq = home.faq.id(faqId);
    if (faq) {
      faq.question = question;
      faq.answer = answer;
      await home.save();

      res.status(200).json({
        status: true,
        message: "Faq updated successfully",
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Faq not found",
      });
    }
  } catch (err) {
    next(err);
  }
};
