


const PDFDocument = require("pdfkit");
const fs = require("fs");
const axios = require("axios");
const https = require("https");

// Function to download the logo
const downloadImage = async (url, dest) => {
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const response = await axios.get(url, {
    responseType: "stream",
    httpsAgent: agent,
  });

  const writer = fs.createWriteStream(dest);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};

const generateInvoice = async (data) => {
  try {
    // Define file paths
    const logoUrl =
      "https://pmjjewels.com/pmj_ecommerce/static/src/img/logo_blue.png";
    const logoPath = "./public/logo_blue.png"; // Save the logo locally
    const invoicePath = `public/invoices/Invoice_${data.planId}_${data.paidMonth}.pdf`;

    // Download the logo
    await downloadImage(logoUrl, logoPath);

    const doc = new PDFDocument({ margin: 50 });

    doc.pipe(fs.createWriteStream(invoicePath));

    doc.image(logoPath, 50, 20, { width: 100 }).moveDown();

    doc
      .fontSize(16)
      .text("PMJ GEMS AND JEWELLERS PVT LTD", { align: "center" })
      .moveDown(0.5)
      .fontSize(10)
      .moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Plan Id:", 50, 100, { continued: true })
      .font("Helvetica")
      .text(`${data.planId}`)
      .moveDown(1);

    doc
      .font("Helvetica-Bold")
      .text("Transaction ID:", 300, 100, { continued: true })
      .font("Helvetica")
      .text(`${data.transactionId}`)
      .moveDown(1);

    const leftX = 50;
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Name: ", leftX, doc.y, { continued: true })
      .font("Helvetica")
      .text(`${data.name}`)
      .moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Account No. : ", leftX, doc.y, { continued: true })
      .font("Helvetica")
      .text(`${data.digitalAccount}`)
      .moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("Address: ", leftX, doc.y, { continued: true })
      .font("Helvetica")
      .text(
        `${
          data.address ||
          "Hargoving nagar street no.2, Jalandhar, Punjab, India"
        }`
      )
      .moveDown(1);

    doc
      .font("Helvetica-Bold")
      .text("Joining Date: ", leftX, doc.y, { continued: true })
      .font("Helvetica")
      .text(`${new Date(data.startDate).toDateString()}`)
      .moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("End Date: ", leftX, doc.y, { continued: true })
      .font("Helvetica")
      .text(`${new Date(data.endDate).toDateString()}`)
      .moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("Payment Date: ", leftX, doc.y, { continued: true })
      .font("Helvetica")
      .text(`${new Date().toDateString()}`)
      .moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("Due Date: ", leftX, doc.y, { continued: true })
      .font("Helvetica")
      .text(`${new Date(data.dueDate).toDateString()}`)
      .moveDown(0.5);

    doc
      .font("Helvetica-Bold")
      .text("Maturity Date: ", leftX, doc.y, { continued: true })
      .font("Helvetica")
      .text(`${new Date(data.maturityDate).toDateString()}`)
      .moveDown(1);

    // Separator Line
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(1);

    doc
      .font("Helvetica")
      .text(`Plan: ${data.planName || "GDPK - 50000"}`, { align: "left" })
      .moveDown(0.5)
      .text(`Installment Amount: ${data.amountPaid}`, { align: "left" })
      .moveDown(0.5)
      .text(`Redemption Amount: ${data.redemptionValue}`, { align: "left" })
      .moveDown(0.5)
      .text(`Paid EMI: ${data.paidMonth}`, { align: "left" })
      .moveDown(0.5)
      .text(`Pending EMI: ${11 - +data.paidMonth}`, { align: "left" })
      .moveDown(12);

    // Footer Section
    // Customer Signature (left-aligned)
    doc
      .font("Helvetica-Bold")
      .text("Customer Signature", 50, doc.y, { align: "left" });

    // MANOHARLAL JEWELLERS & EXPORTERS (right-aligned)
    doc
      .text("PMJ GEMS AND JEWELLERS PVT LTD", 400, doc.y, {
        align: "right",
      })
      .moveDown(3);

    // Add computer-generated voucher note
    doc
      .font("Helvetica")
      .fontSize(8)
      .text("This is a computer-generated voucher", { align: "center" });

    doc.end();

    console.log(`Invoice generated at ${invoicePath}`);
    return invoicePath;
  } catch (error) {
    console.error("Error generating invoice:", error.message);
    throw error;
  }
};

module.exports = generateInvoice;

