import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("RESEND_API_KEY loaded:", !!process.env.RESEND_API_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);

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
  console.log("Sending payment email to:", to);
  console.log("FROM_EMAIL:", process.env.FROM_EMAIL);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #1E90FF; padding-bottom: 15px;">
        <h2 style="color: #1E90FF; margin: 0; font-size: 26px;">QuickPark 🚗</h2>
        <p style="color: #666; margin: 5px 0 0; font-size: 14px;">Your Smart Parking Companion</p>
      </div>
      <div style="padding: 25px 0;">
        <h3 style="color: #28a745; margin-top: 0; font-size: 20px; text-align: center;">✅ Reservation & Payment Confirmed!</h3>
        <p style="font-size: 16px; line-height: 1.5; color: #333333;">Hello <strong>${username || "User"}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.5; color: #555555;">We are pleased to confirm that your parking reservation was successful. Below are your reservation details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px; text-align: left;">
          <thead>
            <tr style="background-color: #1E90FF; color: #ffffff;">
              <th style="padding: 12px; border: 1px solid #dee2e6;">Detail</th>
              <th style="padding: 12px; border: 1px solid #dee2e6;">Information</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #333333;">City / Location</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; color: #555555;">${city}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #333333;">Reserved Slot</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #1E90FF;">Slot ${slotNumber}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #333333;">Duration</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; color: #555555;">${hours} Hour(s)</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #333333;">Amount Paid</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; color: #28a745; font-weight: bold; font-size: 16px;">₹${amount}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #333333; font-family: monospace;">Order ID</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-family: monospace; color: #555555;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #333333; font-family: monospace;">Payment ID</td>
              <td style="padding: 12px; border: 1px solid #dee2e6; font-family: monospace; color: #555555;">${paymentId}</td>
            </tr>
          </tbody>
        </table>
        
        <p style="font-size: 14px; line-height: 1.5; color: #777777; font-style: italic;">* Please present this confirmation email at the parking entrance when arriving.</p>
      </div>
      <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; text-align: center; color: #888888; font-size: 12px;">
        <p style="margin: 0 0 5px;">Thank you for using QuickPark! Drive safely! 🚗</p>
        <p style="margin: 0;">© 2026 QuickPark Inc. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "QuickPark <onboarding@resend.dev>",
      to: [to],
      subject: "Payment Successful - QuickPark",
      html: htmlContent,
    });

    if (error) {
      console.error("RESEND ERROR:", error);
      throw new Error(error.message || "Resend email failed");
    }

    console.log("RESEND SUCCESS:", data);
    return data;
  } catch (error) {
    console.error("Error sending email via Resend API:", error);
    throw error;
  }
}
