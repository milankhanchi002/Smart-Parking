import { Resend } from "resend";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

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
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "QuickPark <onboarding@resend.dev>",
      to: [to],
      subject: "Payment Successful - QuickPark",
      text: message,
    });

    if (error) {
      console.error("Error sending email via Resend API:", error);
      throw error;
    }

    console.log("Email sent successfully:", data.id);
    return data;
  } catch (error) {
    console.error("Error sending email via Resend API:", error);
    throw error;
  }
}
