// src/components/PaymentSuccess.js
import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function PaymentSuccess() {
  const loc = useLocation();
  const {
    city,
    slotNumber,
    hours,
    amount,
    orderId,
    paymentId,
  } = loc.state || {};

  const downloadReceipt = () => {
    if (!paymentId) {
      alert("Receipt not available");
      return;
    }

    // Open PDF in new tab (user can download or print)
    window.open(
      `http://localhost:5000/payment-receipt/${paymentId}`,
      "_blank"
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          maxWidth: 600,
          margin: "auto",
          background: "#fff",
          padding: 24,
          borderRadius: 8,
        }}
      >
        <h1 style={{ color: "#28a745" }}>Payment Successful</h1>

        <p>City: {city}</p>
        <p>Slot: {slotNumber}</p>
        <p>Hours: {hours}</p>
        <p>Amount: ₹{amount}</p>
        <p>Order ID: {orderId}</p>
        <p>Payment ID: {paymentId}</p>

        <button
          onClick={downloadReceipt}
          style={{
            marginTop: 16,
            padding: "10px 16px",
            background: "#1E90FF",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
        Download / Print Receipt
        </button>

        <br /><br />
        <Link to="/">Go to Home</Link>
      </div>
    </div>
  );
}
