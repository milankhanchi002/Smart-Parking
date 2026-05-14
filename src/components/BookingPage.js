// src/components/BookingPage.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookingPage.css";

import SlotMap from "./SlotMap.jsx";

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const city = query.get("city") || "Delhi";

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hours, setHours] = useState(1);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(`http://localhost:5001/slots/${city}`);
        const data = await res.json();

        console.log("City searched:", city);
        console.log("Slots returned:", data);

        setSlots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [city]);

  useEffect(() => {
    let t;
    if (timer > 0) {
      t = setInterval(() => setTimer((s) => s - 1), 1000);
    }
    return () => clearInterval(t);
  }, [timer]);

  const selectSlot = (slot) => {
    if (slot.is_booked) return;
    setSelectedSlot(slot);
    setTimer(600); 
  };

  const proceedToPricing = () => {
    if (!selectedSlot) return alert("Select a slot");
    navigate("/pricing", {
      state: {
        city,
        slotId: selectedSlot.id,
        slotNumber: selectedSlot.slot_number,
        hours,
      },
    });
  };

  return (
    <div className="booking-page-container">
      <div className="booking-content">

        
        <div className="slot-list-section">
          <h2>Available Slots in {city}</h2>

          <div className="map-container">
            
            <SlotMap 
              slots={slots} 
              city={city} 
              onSelect={selectSlot} 
              selectedSlot={selectedSlot}
            />
          </div>

          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="slots-grid">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className={`slot-card ${s.is_booked ? "booked" : "available"} ${
                    selectedSlot?.id === s.id ? "selected" : ""
                  }`}
                  onClick={() => selectSlot(s)}
                >
                  <div className="slot-number">Slot {s.slot_number}</div>
                  <div className="slot-status">
                    {s.is_booked ? "Booked" : "Available"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
        <div className="booking-summary-section">
          {!selectedSlot ? (
            <div className="no-selection-card">Select a slot to book</div>
          ) : (
            <div className="summary-card">
              <div className="summary-info">
                <h3>Booking Summary</h3>
                <p><strong>Slot:</strong> {selectedSlot.slot_number}</p>
                <p><strong>Area:</strong> {selectedSlot.area}</p>

                <label>
                  Hours:
                  <input
                    type="number"
                    min="1"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                  />
                </label>

                <div className="timer">
                  Hold time left: {Math.floor(timer / 60)}:
                  {String(timer % 60).padStart(2, "0")}
                </div>
              </div>

              <button className="confirm-btn" onClick={proceedToPricing}>
                Proceed to Payment
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
