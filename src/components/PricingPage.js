// src/components/PricingPage.js
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PricingPage.css";

export default function PricingPage() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { city, slotId, slotNumber, hours } = loc.state || {};
  const hourlyRate = 20;
  const total = (hours || 0) * hourlyRate;
  const [loading, setLoading] = useState(false);

  const loadScript = (src) => new Promise((res) => {
    const s = document.createElement("script"); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.body.appendChild(s);
  });

  const handlePay = async () => {
    if (!total) return alert("Invalid amount");
    setLoading(true);
    try {
      const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!ok) { alert("Failed to load"); setLoading(false); return; }

      const createRes = await fetch("http://localhost:5000/create-parking-payment", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, city, slotId, hours })
      });
      const createJson = await createRes.json();
      const order = createJson.order;

      const options = {
        key: "rzp_test_Ri4HPnlUXr1sEZ",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "QuickPark",
        description: `Slot ${slotNumber} for ${hours} hours`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const token = localStorage.getItem("token");
            const verifyRes = await fetch("http://localhost:5000/verify-payment", {
              method: "POST", headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : "" },
              body: JSON.stringify({ orderId: response.razorpay_order_id,  paymentId: response.razorpay_payment_id, signature: response.razorpay_signature })
            });
            const verifyJson = await verifyRes.json();
            if (!verifyJson.success) {
  alert("Verification failed");
  setLoading(false);
  return;
}


            // Optionally confirm booking (server sets booked when verify runs)
            navigate("/payment", { state: { city, slotNumber, hours, amount: total, orderId: order.id, paymentId: response.razorpay_payment_id } });

          } catch (err) {
            console.error(err); alert("Error verifying payment");
          } finally { setLoading(false); }
        },
        prefill: { name: "QuickPark User", email: "user@example.com", contact: "9999999999" },
        theme: { color: "#1E90FF" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => { alert("Payment failed: " + resp.error.description); setLoading(false); });
      rzp.open();

    } catch (err) {
      console.error(err); alert("Payment error");
      setLoading(false);
    }
  };

  return (
    <div className="pricing-page-container">
      <div className="pricing-card">
        <h2>Confirm & Pay</h2>
        <p>City: {city}</p>
        <p>Slot: {slotNumber}</p>
        <p>Hours: {hours}</p>
        <p>Total: ₹{total}</p>
        <button className="btn-pay" onClick={handlePay} disabled={loading}>{loading ? "Processing..." : "Pay Now"}</button>
      </div>
    </div>
  );
}
