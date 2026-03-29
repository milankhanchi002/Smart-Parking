
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: process.env.PG_USER || "postgres",
  host: process.env.PG_HOST || "localhost",
  database: process.env.PG_DATABASE || "quickpark",
  password: process.env.PG_PASSWORD || "navreet20041",
  port: process.env.PG_PORT || 5432,
});
// const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_Ri4HPnlUXr1sEZ";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "xvTh04npgHPeCCTQW0NXlnsc";
// const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;


const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/* ===================== NEW: EMAIL SETUP ===================== */
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

async function sendPaymentEmail({
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

  await emailTransporter.sendMail({
    from: `"QuickPark" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Payment Successful - QuickPark",
    text: message,
  });
}
/* ===================== END EMAIL SETUP ===================== */

// ---------- DB init ----------
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'USER'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS slots (
        id SERIAL PRIMARY KEY,
        slot_number INT NOT NULL,
        area VARCHAR(100) NOT NULL,
        is_booked BOOLEAN DEFAULT false,
        booked_by INT REFERENCES users(id),
        parking_hours INT,
        booked_by_username VARCHAR(100),
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        UNIQUE (slot_number, area)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        payment_id VARCHAR(255),
        signature VARCHAR(255),
        amount INT NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        city VARCHAR(100),
        slot_id INT,
        slot_number INT,
        hours INT,
        user_id INT,
        user_name VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(20),
        status VARCHAR(20) DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Database initialized");
  } catch (err) {
    console.error("initDB error:", err);
  }
}

/* ===================== REGISTER ===================== */
app.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
    if (userExists.rows.length>0)
      return res.status(400).json({ message: "User exists" });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username,email,password,role) VALUES ($1,$2,$3,$4)",
      [username, email, hashed, role]
    );

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* ===================== LOGIN ===================== */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const r = await pool.query(
      "SELECT * FROM users WHERE username=$1",
      [username]
    );
    if (!r.rows.length)
      return res.status(400).json({ error: "User not found" });

    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      "secretkey",
      { expiresIn: "12h" }
    );

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      role: user.role,
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ error: "server error" });
  }
});
app.get("/admin/payments", async (req, res) => {
  const r = await pool.query(
    "SELECT * FROM payments ORDER BY created_at DESC"
  );
  res.json(r.rows);
});

/* ===================== GET SLOTS ===================== */
app.get("/slots/:area", async (req, res) => {
  const { area } = req.params;
  try {
    const q = await pool.query(
      "SELECT id, slot_number, area, is_booked, booked_by_username, lat, lng FROM slots WHERE area=$1 ORDER BY slot_number",
      [area]
    );
    return res.json(q.rows);
  } catch (err) {
    console.error("/slots error:", err);
    return res.status(500).json({ error: "server error" });
  }
});
app.get("/payment-receipt/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    const r = await pool.query(
      "SELECT * FROM payments WHERE payment_id=$1",
      [paymentId]
    );

    if (!r.rows.length) {
      return res.status(404).json({ error: "Receipt not found" });
    }

    const p = r.rows[0];

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=receipt_${paymentId}.pdf`
    );

    doc.fontSize(20).text("QuickPark - Payment Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${p.order_id}`);
    doc.text(`Payment ID: ${p.payment_id}`);
    doc.text(`Status: ${p.status}`);
    doc.text(`Amount: ₹${p.amount}`);
    doc.moveDown();

    doc.text(`City: ${p.city}`);
    doc.text(`Slot Number: ${p.slot_number}`);
    doc.text(`Hours: ${p.hours}`);
    doc.moveDown();

    doc.text(`User: ${p.user_name || "-"}`);
    doc.text(`Email: ${p.email || "-"}`);
    doc.text(`Date: ${new Date(p.created_at).toLocaleString()}`);

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error("receipt error:", err);
    res.status(500).json({ error: "server error" });
  }
});

/* ===================== CREATE PAYMENT ===================== */
app.post("/create-parking-payment", async (req, res) => {
  try {
    const { amount, city = null, slotId = null, hours = null } = req.body;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
    });

    await pool.query(
      `INSERT INTO payments (order_id, amount, currency, city, slot_id, hours, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [order.id, Math.round(amount), "INR", city, slotId, hours, "PENDING"]
    );

    res.json({ order });
  } catch (err) {
    console.error("create-parking-payment error:", err);
    res.status(500).json({ error: "failed to create order" });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    console.log("==== VERIFY PAYMENT CALLED ====");

    const token = req.headers.authorization?.split(" ")[1] || null;
    const { orderId, paymentId, signature } = req.body;

    //  Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      console.log(" SIGNATURE MISMATCH");
      return res
        .status(400)
        .json({ success: false, error: "Verification failed" });
    }

    console.log(" SIGNATURE MATCHED");

    //  Mark payment as PAID
    await pool.query(
      "UPDATE payments SET payment_id=$1, signature=$2, status=$3 WHERE order_id=$4",
      [paymentId, signature, "PAID", orderId]
    );

    //  Fetch payment row
    const pRes = await pool.query(
      "SELECT * FROM payments WHERE order_id=$1 LIMIT 1",
      [orderId]
    );
    const paymentRow = pRes.rows[0];

    //  Decode logged-in user
    let userId = null, username = null, email = null;
    if (token) {
      const decoded = jwt.verify(token, "secretkey");
      userId = decoded.id;
      username = decoded.username;
      email = decoded.email;
    }

   
    if (userId) {
      await pool.query(
        "UPDATE payments SET user_id=$1, user_name=$2, email=$3 WHERE order_id=$4",
        [userId, username, email, orderId]
      );
    }
    //  BOOK SLOT (THIS IS THE FIX)
if (paymentRow.slot_id) {
  const sRes = await pool.query(
    "SELECT * FROM slots WHERE id=$1",
    [paymentRow.slot_id]
  );

  if (sRes.rows.length) {
    const slot = sRes.rows[0];

    if (!slot.is_booked) {
      await pool.query(
        `UPDATE slots
         SET is_booked = true,
             booked_by = $1,
             booked_by_username = $2,
             parking_hours = $3
         WHERE id = $4`,
        [userId, username, paymentRow.hours, paymentRow.slot_id]
      );
    }

    // also store slot_number in payments table
    await pool.query(
      "UPDATE payments SET slot_number=$1 WHERE order_id=$2",
      [slot.slot_number, orderId]
    );
  }
}

   
if (email) {
  try {
    console.log("📧 Sending email to:", email);

    await sendPaymentEmail({
      to: email,
      username,
      city: paymentRow.city,
      slotNumber: paymentRow.slot_number,
      hours: paymentRow.hours,
      amount: paymentRow.amount,
      orderId,
      paymentId,
    });

    console.log("✅ Email sent");
  } catch (mailErr) {
    console.error("Email failed, but payment is SUCCESS:", mailErr.message);
  }
}


    res.json({ success: true });

  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});



/* ===================== START ===================== */
app.listen(PORT, async () => {
  await initDB();
  console.log(`Server listening on http://localhost:${PORT}`);
});
