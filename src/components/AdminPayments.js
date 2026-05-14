// src/components/AdminPayments.js
import React, { useEffect, useState } from "react";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  useEffect(() => {
    fetch(`\${process.env.REACT_APP_API_URL || "http://localhost:5001"}/admin/payments`)
      .then((r) => r.json())
      .then(setPayments)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Payments</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr><th>ID</th><th>Order</th><th>Payment</th><th>Amount</th><th>City</th><th>Slot</th><th>User</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}><td>{p.id}</td><td>{p.order_id}</td><td>{p.payment_id}</td><td>₹{p.amount}</td><td>{p.city}</td><td>{p.slot_id}</td><td>{p.user_name}</td><td>{p.status}</td><td>{new Date(p.created_at).toLocaleString()}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
