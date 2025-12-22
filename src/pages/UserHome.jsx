import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EmergencyNavbar from "../components/EmergencyNavbar";
import { db, auth } from "../firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  addDoc,
} from "firebase/firestore";

import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { qrAgent } from "../rl/qrAgent";
import "./UserHome.css";

/* -----------------------------
   FIX LEAFLET ICONS
----------------------------- */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* -----------------------------
   DISTANCE IN METERS
----------------------------- */
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const metersToText = (m) => {
  if (m == null) return "--";
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
};

const UserHome = () => {
  const navigate = useNavigate();

  const [userLoc, setUserLoc] = useState(null);
  const [riskZones, setRiskZones] = useState([]);
  const [safeZones, setSafeZones] = useState([]);

  const [inRisk, setInRisk] = useState(false);
  const [activeRiskZone, setActiveRiskZone] = useState(null);

  /* FEEDBACK STATE */
  const [feedbackType, setFeedbackType] = useState("Issue");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [sending, setSending] = useState(false);

  /* ⏱️ LAST FIRESTORE UPDATE TIME */
  const lastSentRef = useRef(0);

  /* -----------------------------
     FETCH ACTIVE RISK ZONES
  ----------------------------- */
  useEffect(() => {
    return onSnapshot(collection(db, "riskZones"), (snap) => {
      setRiskZones(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((z) => z.active === true)
      );
    });
  }, []);

  /* -----------------------------
     FETCH ACTIVE SAFE ZONES
  ----------------------------- */
  useEffect(() => {
    return onSnapshot(collection(db, "safeZones"), (snap) => {
      setSafeZones(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((z) => z.active === true)
      );
    });
  }, []);

  /* -----------------------------
     LIVE LOCATION TRACKING (THROTTLED)
  ----------------------------- */
  useEffect(() => {
    if (!navigator.geolocation || !auth.currentUser) return;

    const uid = auth.currentUser.uid;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // ✅ UI updates instantly
        setUserLoc({ latitude, longitude });

        // ⏱️ Firestore update every 15 seconds
        const now = Date.now();
        if (now - lastSentRef.current >= 15000) {
          lastSentRef.current = now;

          await setDoc(
            doc(db, "liveUsers", uid),
            {
              latitude,
              longitude,
              status: "ACTIVE",
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }

        // 🔴 Check risk zones
        let danger = false;
        let matchedZone = null;

        for (const zone of riskZones) {
          const d = getDistanceMeters(
            latitude,
            longitude,
            zone.latitude,
            zone.longitude
          );
          if (d <= zone.radius) {
            danger = true;
            matchedZone = zone;
            break;
          }
        }

        setInRisk(danger);
        setActiveRiskZone(matchedZone);
      },
      console.error,
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [riskZones]);

  /* -----------------------------
     SAFE ZONES FOR ACTIVE RISK
  ----------------------------- */
  const relatedSafeZones = safeZones.filter(
    (s) => s.riskZoneId === activeRiskZone?.id
  );

  /* -----------------------------
     RL AGENT SELECTION
  ----------------------------- */
  const selectedSafeZone = qrAgent(userLoc, relatedSafeZones);

  const distanceToSafeZone =
    userLoc && selectedSafeZone
      ? getDistanceMeters(
          userLoc.latitude,
          userLoc.longitude,
          selectedSafeZone.latitude,
          selectedSafeZone.longitude
        )
      : null;

  const lastUpdated = userLoc
    ? new Date().toLocaleTimeString()
    : "--";

  /* -----------------------------
     SUBMIT FEEDBACK
  ----------------------------- */
  const submitFeedback = async () => {
    if (!feedbackMsg.trim()) {
      alert("Please enter your feedback");
      return;
    }

    try {
      setSending(true);

      await addDoc(collection(db, "feedbackReports"), {
        uid: auth.currentUser?.uid || "anonymous",
        type: feedbackType,
        message: feedbackMsg,
        createdAt: serverTimestamp(),
      });

      setFeedbackMsg("");
      alert("Thank you for your feedback 🙏");
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <EmergencyNavbar />

      <main className="main-container">
        <div className="hero">
          <h1 className="hero-title">🛡 Welcome to Safe Zone</h1>
          <p className="hero-text">
            Live emergency monitoring and navigation assistance.
          </p>
        </div>

        {/* STATUS */}
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title">📍 Current Status</h2>
            {inRisk ? (
              <div className="risk-alert">⚠ Inside Risk Zone</div>
            ) : (
              <div className="safe-alert">✅ Safe Area</div>
            )}
            <p><b>Risk Zone:</b> {activeRiskZone?.name || "None"}</p>
            <p><b>Last Update:</b> {lastUpdated}</p>
          </div>

          <div className="card">
            <h2 className="card-title">🟢 Nearest Safe Zone</h2>
            {selectedSafeZone ? (
              <>
                <p><b>Distance:</b> {metersToText(distanceToSafeZone)}</p>
                <div className="safe-alert">
                  Follow navigation to reach safety
                </div>
              </>
            ) : (
              <p>No safe zone available</p>
            )}
          </div>
        </div>

        {/* MAP */}
        {inRisk && userLoc && activeRiskZone && (
          <div className="danger-card">
            <h2 className="danger-title">🚨 DANGER ALERT</h2>

            <div className="map-box">
              <MapContainer
                center={[userLoc.latitude, userLoc.longitude]}
                zoom={14}
                style={{ height: "340px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Circle
                  center={[
                    activeRiskZone.latitude,
                    activeRiskZone.longitude,
                  ]}
                  radius={activeRiskZone.radius}
                  pathOptions={{ color: "red", fillOpacity: 0.25 }}
                />

                {relatedSafeZones.map((z) => (
                  <Circle
                    key={z.id}
                    center={[z.latitude, z.longitude]}
                    radius={z.radius}
                    pathOptions={{ color: "green", fillOpacity: 0.35 }}
                  />
                ))}

                <Marker position={[userLoc.latitude, userLoc.longitude]}>
                  <Popup>You are here</Popup>
                </Marker>
              </MapContainer>
            </div>

            {selectedSafeZone && (
              <button
                className="navigate-btn"
                onClick={() =>
                  navigate(
                    `/navigate?slat=${selectedSafeZone.latitude}&slng=${selectedSafeZone.longitude}`
                  )
                }
              >
                🧭 Start Emergency Navigation
              </button>
            )}
          </div>
        )}

        {/* FEEDBACK */}
        <div className="card" style={{ marginTop: "40px" }}>
          <h2 className="card-title">📝 Feedback & Suggestions</h2>

          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
          >
            <option value="Issue">⚠ Report an Issue</option>
            <option value="Suggestion">💡 Suggest Improvement</option>
            <option value="Experience">⭐ Share Experience</option>
          </select>

          <textarea
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            placeholder="Describe your feedback..."
            rows={4}
          />

          <button
            className="navigate-btn"
            onClick={submitFeedback}
            disabled={sending}
          >
            {sending ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default UserHome;
