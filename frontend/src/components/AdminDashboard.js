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
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/admin/payments`, {
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
      `${process.env.REACT_APP_API_URL || "http://localhost:5001"}/payment-receipt/${paymentId}`,
      "_blank"
    );
  };
  const unbookSlot = async (slotId) => {
  try {

    const res = await fetch(
      `${process.env.REACT_APP_API_URL || "http://localhost:5001"}/admin/unbook-slot/${slotId}`,
      {
        method: "PUT",
      }
    );

    const data = await res.json();

    if (data.success) {
      alert("Slot released");

      // refresh table
      setPayments((prev) =>
        prev.map((p) =>
          p.slot_id === slotId
            ? { ...p, status: "RELEASED" ,
              slot_number: "AVAILABLE"
            }
            : p
        )
      );

    } else {
      alert("Failed");
    }

  } catch (err) {
    console.error(err);
    alert("Error");
  }
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
          <div className="table-container">
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
                <th>Actions</th>
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
                    <td>
    {p.status === "PAID" ? (
      <button
        onClick={() => unbookSlot(p.slot_id)}
        style={{
          padding: "6px 10px",
          background: "red",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Free Slot
      </button>
    ) : (
      "-"
    )}
  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
