import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Decode JWT safely to check ADMIN role
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));

      if (decoded.role !== "ADMIN") {
        alert("Access denied: Admins only");
        navigate("/");
        return;
      }
    } catch (err) {
      console.error("Invalid token");
      navigate("/login");
      return;
    }

    // ✅ Fetch all payments
    fetch("http://localhost:5000/admin/payments", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPayments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  // ✅ OPEN RECEIPT (PRINT / DOWNLOAD)
  const openReceipt = (paymentId) => {
    if (!paymentId) {
      alert("Receipt not available");
      return;
    }

    window.open(
      `http://localhost:5000/payment-receipt/${paymentId}`,
      "_blank"
    );
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-card">
        {loading ? (
          <p className="loading-text">Loading payments...</p>
        ) : payments.length === 0 ? (
          <p className="loading-text">No bookings found</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>City</th>
                <th>Slot</th>
                <th>Hours</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Receipt</th> {/* ✅ NEW */}
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.user_name || "-"}</td>
                  <td>{p.email || "-"}</td>
                  <td>{p.city || "-"}</td>
                  <td>{p.slot_number || "-"}</td>
                  <td>{p.hours || "-"}</td>
                  <td>₹{p.amount}</td>

                  <td>
                    <span
                      className={`status ${
                        p.status === "PAID"
                          ? "paid"
                          : p.status === "FAILED"
                          ? "failed"
                          : "pending"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>

                  <td>{new Date(p.created_at).toLocaleString()}</td>

                  {/*  PRINT / DOWNLOAD RECEIPT */}
                  <td>
                    {p.status === "PAID" && p.payment_id ? (
                      <button
                        onClick={() => openReceipt(p.payment_id)}
                        style={{
                          padding: "6px 10px",
                          background: "#1E90FF",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                      Print / Download
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
