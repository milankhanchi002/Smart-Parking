import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pkg from "pg";
import cron from "node-cron";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Razorpay from "razorpay";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import { sendPaymentEmail } from "./utils/email.js";

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  "http://localhost:3000",
  "https://smart-parking-livid-eta.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.options(/(.*)/, cors());
app.use(bodyParser.json());

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      user: process.env.PG_USER || "postgres",
      host: process.env.PG_HOST || "localhost",
      database: process.env.PG_DATABASE || "quickpark",
      password: process.env.PG_PASSWORD || "navreet20041",
      port: process.env.PG_PORT || 5432,
    };
const pool = new Pool(poolConfig);
// const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_SmRBGJClRZk6jk";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "4yCJj3p1KgWexdoXevO5KDcB";
// const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;


const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

/* ===================== EMAIL SETUP ===================== */
// Email logic is now imported from utils/email.js
/* ===================== END EMAIL SETUP ===================== */

// ---------- DB init ----------
async function initDB() {
  try {
    const client = await pool.connect();
    console.log("Database connection successful");
    client.release();

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
        booking_end TIMESTAMP,
        booked_by_username VARCHAR(100),
        lat DOUBLE PRECISION,
        lng DOUBLE PRECISION,
        UNIQUE (slot_number, area)
      );
    `);

    // Add booking_end column if the table was created before this fix
    await pool.query(`ALTER TABLE slots ADD COLUMN IF NOT EXISTS booking_end TIMESTAMP;`);

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
    const dummySlotsQuery = `
      INSERT INTO slots (slot_number, area, is_booked, booked_by, booked_by_username) VALUES
      (1, 'Delhi', false, null, null), (2, 'Delhi', false, null, null), (3, 'Delhi', false, null, null), (4, 'Delhi', false, null, null), (5, 'Delhi', false, null, null),
      (6, 'Delhi', false, null, null), (7, 'Delhi', false, null, null), (8, 'Delhi', false, null, null), (9, 'Delhi', false, null, null), (10, 'Delhi', false, null, null),

      (1, 'Mumbai', false, null, null), (2, 'Mumbai', false, null, null), (3, 'Mumbai', false, null, null), (4, 'Mumbai', false, null, null), (5, 'Mumbai', false, null, null),
      (6, 'Mumbai', false, null, null), (7, 'Mumbai', false, null, null), (8, 'Mumbai', false, null, null), (9, 'Mumbai', false, null, null), (10, 'Mumbai', false, null, null),

      (1, 'Bengaluru', false, null, null), (2, 'Bengaluru', false, null, null), (3, 'Bengaluru', false, null, null), (4, 'Bengaluru', false, null, null), (5, 'Bengaluru', false, null, null),
      (6, 'Bengaluru', false, null, null), (7, 'Bengaluru', false, null, null), (8, 'Bengaluru', false, null, null), (9, 'Bengaluru', false, null, null), (10, 'Bengaluru', false, null, null),

      (1, 'Chandigarh', false, null, null), (2, 'Chandigarh', false, null, null), (3, 'Chandigarh', false, null, null), (4, 'Chandigarh', false, null, null), (5, 'Chandigarh', false, null, null),
      (6, 'Chandigarh', false, null, null), (7, 'Chandigarh', false, null, null), (8, 'Chandigarh', false, null, null), (9, 'Chandigarh', false, null, null), (10, 'Chandigarh', false, null, null)
      ON CONFLICT (slot_number, area) DO NOTHING;
    `;
    await pool.query(dummySlotsQuery);

    console.log("Database initialized");
  } catch (err) {
    console.error("initDB error:", err);
  }
}

/* ===================== REGISTER ===================== */
app.post("/register", async (req, res) => {
  console.log("--> Received POST /register request with body:", req.body);
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
      process.env.JWT_SECRET || "secretkey",
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

app.get("/test-email", async (req, res) => {
  try {
    const result = await sendPaymentEmail({
      to: req.query.to || "MY_TEST_EMAIL_HERE",
      username: "Test User",
      city: "Delhi",
      slotNumber: 1,
      hours: 1,
      amount: 50,
      orderId: "test_order",
      paymentId: "test_payment"
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error("Test email failed:", err);
    res.status(500).json({ success: false, error: err.message });
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
console.log(orderId);
console.log(paymentId);
console.log(signature);
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
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
       parking_hours = $3,
       booking_end = NOW() + (($3::int) * INTERVAL '1 hour')
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
console.log("ORDER:", orderId);
console.log("PAYMENT:", paymentId);
console.log("SIGNATURE:", signature);
console.log("GENERATED:", generatedSignature);
   
    console.log("Decoded user email:", email);
    console.log("Decoded username:", username);
    console.log("Payment row:", paymentRow);

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

app.put("/admin/unbook-slot/:id", async (req, res) => {
  try {

    const slotId = req.params.id;

    await pool.query(
      `UPDATE slots
       SET is_booked = false,
           booked_by = NULL,
           booked_by_username = NULL,
           parking_hours = NULL,
           booking_end = NULL
       WHERE id = $1`,
      [slotId]
    );

    await pool.query(
      `UPDATE payments
       SET status = 'RELEASED'
       WHERE slot_id = $1
       AND status = 'PAID'`,
      [slotId]
    );

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});
cron.schedule("* * * * *", async () => {
  try {

    await pool.query(`
      UPDATE slots
      SET is_booked = false,
          booked_by = NULL,
          booked_by_username = NULL,
          parking_hours = NULL,
          booking_end = NULL
      WHERE booking_end IS NOT NULL
      AND booking_end <= NOW()
    `);
await pool.query(`
  UPDATE payments
  SET status = 'RELEASED'
  WHERE status = 'PAID'
  AND slot_id IN (
    SELECT id FROM slots
    WHERE booking_end IS NOT NULL
    AND booking_end <= NOW()
  )
`);
    console.log("Checked expired slots");

  } catch (err) {
    console.error("Cron error:", err);
  }
});


/* ===================== START ===================== */
app.listen(PORT, async () => {
  await initDB();
  console.log(`Server is running on port ${PORT}`);
});
