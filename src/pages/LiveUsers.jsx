import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";

import AdminNav from "../components/AdminNav";

/* Leaflet */
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/* Professional Icons */
import { FaUserAlt, FaMapMarkerAlt } from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";
import { BsCircleFill } from "react-icons/bs";

/* Fix Leaflet marker issue */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LiveUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  /* 🗺️ Modal State */
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null);

  /* 🔐 Protect route */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/admin/login");
    });
    return () => unsub();
  }, [navigate]);

  /* 🔥 Live users listener */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "liveUsers"), (snap) => {
      setUsers(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });
    return () => unsub();
  }, []);

  const openMap = (lat, lng) => {
    setLocation({ lat, lng });
    setShowMap(true);
  };

  return (
    <div style={styles.layout}>
      <AdminNav />

      <main style={styles.content}>
        <h1 style={styles.pageTitle}>Live User Locations</h1>

        {users.length === 0 && (
          <p style={styles.empty}>No live users found</p>
        )}

        <div style={styles.grid}>
          {users.map((user) => (
            <div key={user.id} style={styles.card}>
              <p style={styles.row}>
                <FaUserAlt style={styles.icon} />
                <b>User ID:</b>&nbsp;{user.id}
              </p>

              <p style={styles.row}>
                <FaMapMarkerAlt style={styles.icon} />
                Latitude: {user.latitude}
              </p>

              <p style={styles.row}>
                <FaMapMarkerAlt style={styles.icon} />
                Longitude: {user.longitude}
              </p>

              <p style={styles.status}>
                <BsCircleFill style={styles.liveDot} />
                ACTIVE
              </p>

              <button
                style={styles.mapBtn}
                onClick={() => openMap(user.latitude, user.longitude)}
              >
                <MdMyLocation size={18} />
                View Live Location
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* 🗺️ MAP MODAL (BOX STRUCTURE) */}
      {showMap && location && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Map View</h3>
              <button
                style={styles.closeBtn}
                onClick={() => setShowMap(false)}
              >
                Close
              </button>
            </div>

            <MapContainer
              center={[location.lat, location.lng]}
              zoom={15}
              style={styles.map}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[location.lat, location.lng]}>
                <Popup>User Live Location</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveUsers;

/* ---------------- STYLES ---------------- */

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  content: {
    flex: 1,
    padding: "36px",
  },

  pageTitle: {
    fontSize: "28px",
    color: "#0f172a",
    marginBottom: "20px",
  },

  empty: {
    color: "#64748b",
    marginBottom: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 12px 26px rgba(0,0,0,0.06)",
  },

  row: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#0f172a",
  },

  icon: {
    color: "#2563eb",
  },

  status: {
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "600",
    color: "#16a34a",
  },

  liveDot: {
    fontSize: "10px",
  },

  mapBtn: {
    marginTop: "14px",
    width: "100%",
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },

  /* MODAL */
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#ffffff",
    width: "85%",
    height: "80%",
    borderRadius: "18px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  closeBtn: {
    background: "#0f766e",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },

  map: {
    flex: 1,
    borderRadius: "14px",
  },
};
