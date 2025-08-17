const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create a transporter

  // Send email using nodemailer Google SMTP settings

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL || 'your_gmail_address@gmail.com',
      pass: process.env.SMTP_PASSWORD || 'your_gmail_app_password',
    },
  });

  // Define the email options
  const message = {
    from: `${process.env.FROM_NAME || "Expense Tracker"} <${
      process.env.FROM_EMAIL || "noreply@expensetracker.com"
    }>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // Send the email
  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
