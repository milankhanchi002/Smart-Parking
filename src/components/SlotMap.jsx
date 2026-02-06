import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import cityCoordinates from "../utils/cityCordinates.js";

export default function SlotMap({ slots, city, onSelect, selectedSlot }) {


  const cityCenter = cityCoordinates[city] || cityCoordinates["Delhi"];

  
  const defaultIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });


  const selectedIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div style={{ height: "350px", width: "100%", borderRadius: "10px" }}>
      <MapContainer
        center={[cityCenter.lat, cityCenter.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

       
        {slots.map((slot) => {
       
          if (!slot.lat || !slot.lng) return null;

          return (
            <Marker
              key={slot.id}
              position={[slot.lat, slot.lng]}
              icon={selectedSlot?.id === slot.id ? selectedIcon : defaultIcon}
              eventHandlers={{
                click: () => onSelect(slot),
              }}
            >
              <Popup>
                <b>Slot {slot.slot_number}</b> <br />
                Status: {slot.is_booked ? "Booked" : "Available"} <br />

                <button
                  onClick={() => onSelect(slot)}
                  style={{
                    marginTop: "5px",
                    padding: "5px 10px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    borderRadius: "5px",
                  }}
                >
                  Select Slot
                </button>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
