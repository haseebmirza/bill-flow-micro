const nodemailer = require("nodemailer");
const config = require("../config");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth:
        config.email.user && config.email.pass
          ? { user: config.email.user, pass: config.email.pass }
          : undefined,
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  try {
    const info = await getTransporter().sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };
