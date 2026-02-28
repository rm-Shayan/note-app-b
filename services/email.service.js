import nodemailer from "nodemailer";
import { ApiError } from "../utils/ApiError.js"; // File path spelling check (utiLs -> utils)
import { MAIL_HOST, MAIL_PASS, MAIL_USER, MAIL_PORT } from "../constants.js"; // Use your config file

export const sendMail = async ({ to, subject, message }) => {
  try {
    // 1️⃣ Transporter Configuration
    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT), // Port hamesha number hona chahiye
      secure: Number(MAIL_PORT) === 465, // Agar 465 hai toh true, warna false
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });

    // 2️⃣ Mail options
    const mailOptions = {
      from: `" Note App Support" <${MAIL_USER}>`,
      to,
      subject,
      html: message,
    };

    // 3️⃣ Send mail
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`📧 Email sent: ${info.messageId}`);
    return true;

  } catch (error) {
    console.error("❌ Email service error:", error.message);
    // Custom ApiError throw karna behtar hai debugging ke liye
    throw new ApiError(500, `Email delivery failed: ${error.message}`);
  }
};