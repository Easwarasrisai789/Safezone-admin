import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

import AdminNav from "../components/AdminNav";

/* Leaflet */
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* Icon */
import { FaExclamationTriangle } from "react-icons/fa";

/* --------------------------------------------------
   FIX LEAFLET MARKER ICON
-------------------------------------------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* --------------------------------------------------
   MAP CLICK HANDLER
-------------------------------------------------- */
const LocationPicker = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
};

const RiskZone = () => {
  const navigate = useNavigate();

  const [zones, setZones] = useState([]);
  const [location, setLocation] = useState(null);
  const [zoneName, setZoneName] = useState("");

  /* --------------------------------------------------
     AUTH PROTECTION
  -------------------------------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/admin/login");
    });
    return () => unsub();
  }, [navigate]);

  /* --------------------------------------------------
     FETCH ONLY ACTIVE RISK ZONES
  -------------------------------------------------- */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "riskZones"), (snap) => {
      const activeZones = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(
          (z) =>
            z.active !== false &&
            !Number.isNaN(Number(z.latitude)) &&
            !Number.isNaN(Number(z.longitude))
        )
        .map((z) => ({
          ...z,
          latitude: Number(z.latitude),
          longitude: Number(z.longitude),
          radius: Number(z.radius) || 10000,
        }));

      setZones(activeZones);
    });

    return () => unsub();
  }, []);

  /* --------------------------------------------------
     SAVE RISK ZONE (ACTIVE BY DEFAULT)
  -------------------------------------------------- */
  const saveRiskZone = async () => {
    if (!location || !zoneName.trim()) {
      alert("Enter zone name and select a location");
      return;
    }

    await addDoc(collection(db, "riskZones"), {
      name: zoneName,
      latitude: location.lat,
      longitude: location.lng,
      radius: 10000,        // 10 KM
      active: true,         // ✅ IMPORTANT
      createdAt: serverTimestamp(),
    });

    setZoneName("");
    setLocation(null);
    alert("Risk Zone Added Successfully");
  };

  return (
    <div style={styles.layout}>
      <AdminNav />

      <main style={styles.content}>
        <h1 style={styles.title}>
          <FaExclamationTriangle />
          Add Risk Zone (10 KM Radius)
        </h1>

        <input
          style={styles.input}
          placeholder="Risk Zone Name"
          value={zoneName}
          onChange={(e) => setZoneName(e.target.value)}
        />

        <div style={styles.mapBox}>
          <MapContainer
            center={[16.5062, 80.648]}
            zoom={13}
            style={styles.map}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationPicker setLocation={setLocation} />

            {/* PREVIEW NEW ZONE */}
            {location && (
              <>
                <Marker position={[location.lat, location.lng]}>
                  <Popup>New Risk Zone</Popup>
                </Marker>
                <Circle
                  center={[location.lat, location.lng]}
                  radius={10000}
                  pathOptions={{ color: "red", fillOpacity: 0.25 }}
                />
              </>
            )}

            {/* EXISTING ACTIVE ZONES ONLY */}
            {zones.map((z) => (
              <Circle
                key={z.id}
                center={[z.latitude, z.longitude]}
                radius={z.radius}
                pathOptions={{ color: "red", fillOpacity: 0.2 }}
              />
            ))}
          </MapContainer>
        </div>

        <button style={styles.btn} onClick={saveRiskZone}>
          Save Risk Zone
        </button>
      </main>
    </div>
  );
};

export default RiskZone;

/* --------------------------------------------------
   STYLES
-------------------------------------------------- */
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  content: {
    flex: 1,
    padding: "30px",
  },
  title: {
    fontSize: "26px",
    color: "#b91c1c",
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    width: "100%",
    marginBottom: "12px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  mapBox: {
    height: "420px",
    borderRadius: "14px",
    overflow: "hidden",
    marginBottom: "14px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
  },
  map: {
    height: "100%",
    width: "100%",
  },
  btn: {
    width: "100%",
    background: "#dc2626",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 500,
  },
};
