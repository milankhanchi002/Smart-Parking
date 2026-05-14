import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a professional Nodemailer transport using Resend SMTP
const emailTransporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 465,
  secure: true, // Use TLS
  auth: {
    user: "resend", // Resend SMTP username is always 'resend'
    pass: process.env.RESEND_API_KEY, 
  },
});

export async function sendPaymentEmail({
  to,
  username,
  city,
  slotNumber,
  hours,
  amount,
  orderId,
  paymentId,
}) {
  const message = `
Hello ${username || "User"},

✅ Your parking payment was successful!

City: ${city}
Slot Number: ${slotNumber}
Hours: ${hours}
Amount Paid: ₹${amount}
Order ID: ${orderId}
Payment ID: ${paymentId}

Thank you for using QuickPark 🚗
  `;

  try {
    const info = await emailTransporter.sendMail({
      from: `"QuickPark" <${process.env.EMAIL_FROM || "onboarding@resend.dev"}>`,
      to,
      subject: "Payment Successful - QuickPark",
      text: message,
    });
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    throw error;
  }
}
