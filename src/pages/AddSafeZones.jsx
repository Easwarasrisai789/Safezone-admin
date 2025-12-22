import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminNav from "../components/AdminNav";

import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* -------------------------------
   MAP CLICK HANDLER (ADD SAFE ZONE)
-------------------------------- */
const SafeZonePicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
};

const AddSafeZones = () => {
  const [riskZones, setRiskZones] = useState([]);
  const [selectedRiskZone, setSelectedRiskZone] = useState(null);
  const [safeZones, setSafeZones] = useState([]);

  /* --------------------------------------------------
     FETCH ONLY ACTIVE RISK ZONES
  -------------------------------------------------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "riskZones"), (snap) => {
      const activeRiskZones = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((z) => z.active !== false); // ✅ ONLY ACTIVE

      setRiskZones(activeRiskZones);
    });
    return () => unsub();
  }, []);

  /* --------------------------------------------------
     FETCH ONLY ACTIVE SAFE ZONES FOR SELECTED RISK ZONE
  -------------------------------------------------- */
  useEffect(() => {
    if (!selectedRiskZone) return;

    const unsub = onSnapshot(collection(db, "safeZones"), (snap) => {
      const activeSafeZones = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (z) =>
            z.riskZoneId === selectedRiskZone.id &&
            z.active !== false // ✅ ONLY ACTIVE
        );

      setSafeZones(activeSafeZones);
    });

    return () => unsub();
  }, [selectedRiskZone]);

  /* --------------------------------------------------
     ADD SAFE ZONE (100m, ACTIVE)
  -------------------------------------------------- */
  const addSafeZone = async (latlng) => {
    if (!selectedRiskZone) return;

    await addDoc(collection(db, "safeZones"), {
      riskZoneId: selectedRiskZone.id,
      latitude: latlng.lat,
      longitude: latlng.lng,
      radius: 100,
      active: true,
      createdAt: new Date(),
    });
  };

  /* --------------------------------------------------
     DELETE SAFE ZONE
  -------------------------------------------------- */
  const removeSafeZone = async (id) => {
    if (!window.confirm("Are you sure you want to remove this Safe Zone?"))
      return;

    await deleteDoc(doc(db, "safeZones", id));
  };

  return (
    <div style={styles.layout}>
      <AdminNav />

      <main style={styles.content}>
        <h1 style={styles.title}>
          Add / Remove Safe Zones (100m) inside Risk Zone
        </h1>

        {/* SELECT ACTIVE RISK ZONE */}
        <select
          style={styles.select}
          onChange={(e) =>
            setSelectedRiskZone(
              riskZones.find((z) => z.id === e.target.value)
            )
          }
        >
          <option value="">Select Active Risk Zone</option>
          {riskZones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name || "Unnamed Risk Zone"}
            </option>
          ))}
        </select>

        {/* MAP */}
        {selectedRiskZone && (
          <>
            <div style={styles.mapWrapper}>
              <MapContainer
                center={[
                  selectedRiskZone.latitude,
                  selectedRiskZone.longitude,
                ]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="© OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 🔴 ACTIVE RISK ZONE */}
                <Circle
                  center={[
                    selectedRiskZone.latitude,
                    selectedRiskZone.longitude,
                  ]}
                  radius={10000}
                  pathOptions={{ color: "red", fillOpacity: 0.15 }}
                />

                {/* 🟢 ACTIVE SAFE ZONES ONLY */}
                {safeZones.map((z) => (
                  <Circle
                    key={z.id}
                    center={[z.latitude, z.longitude]}
                    radius={100}
                    pathOptions={{ color: "green", fillOpacity: 0.3 }}
                    eventHandlers={{
                      click: () => removeSafeZone(z.id),
                    }}
                  >
                    <Popup>
                      <b>Safe Zone</b>
                      <br />
                      Radius: 100m
                      <br />
                      <button
                        style={styles.deleteBtn}
                        onClick={() => removeSafeZone(z.id)}
                      >
                        Delete
                      </button>
                    </Popup>
                  </Circle>
                ))}

                {/* ADD SAFE ZONE */}
                <SafeZonePicker onPick={addSafeZone} />
              </MapContainer>
            </div>

            <p style={styles.hint}>
              👉 Click inside the <b>red area</b> to add a Safe Zone (100m)
              <br />
              👉 Only <b>ACTIVE</b> zones are shown here
            </p>

            <div style={styles.legend}>
              <div style={styles.legendItem}>
                <span style={{ ...styles.dot, background: "#dc2626" }} />
                Active Risk Zone (10 km)
              </div>
              <div style={styles.legendItem}>
                <span style={{ ...styles.dot, background: "#16a34a" }} />
                Active Safe Zone (100 m)
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AddSafeZones;

/* -------------------------------
   STYLES (INLINE)
-------------------------------- */
/* ===============================
   PROFESSIONAL ADMIN STYLES
================================ */
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#f1f5f9", // subtle gray
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  content: {
    flex: 1,
    padding: "32px 40px",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: "6px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "24px",
  },

  select: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    width: "340px",
    background: "#ffffff",
    outline: "none",
    cursor: "pointer",
    transition: "border 0.2s, box-shadow 0.2s",
  },

  mapWrapper: {
    height: "480px",
    marginTop: "20px",
    borderRadius: "18px",
    overflow: "hidden",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.6)",
  },

  hint: {
    marginTop: "14px",
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
  },

  legend: {
    display: "flex",
    gap: "26px",
    marginTop: "18px",
    padding: "14px 18px",
    background: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    width: "fit-content",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#334155",
    fontWeight: 500,
  },

  dot: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
  },

  deleteBtn: {
    marginTop: "8px",
    padding: "6px 12px",
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.2s",
  },
};
