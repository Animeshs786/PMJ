const Home = require("../../../models/home");

exports.updateFaq = async (req, res, next) => {
  try {
    const { faqId, question, answer } = req.body;
    const home = await Home.findById("6707c53a47953ec0f4270050");

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
