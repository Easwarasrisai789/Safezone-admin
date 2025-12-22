import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import EmergencyNavbar from "../components/EmergencyNavbar";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Circle,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* -----------------------------
   Decode OSRM polyline
----------------------------- */
const decodePolyline = (encoded) => {
  let points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
};

/* -----------------------------
   Convert OSRM step → text
----------------------------- */
const stepToText = (step) => {
  const d = Math.round(step.distance);

  switch (step.maneuver.type) {
    case "depart":
      return `Start and go straight for ${d} m`;
    case "turn":
      return `Turn ${step.maneuver.modifier} and continue for ${d} m`;
    case "arrive":
      return "✅ You have reached the Safe Zone";
    default:
      return `Continue for ${d} m`;
  }
};

const NavigateMap = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [userLoc, setUserLoc] = useState(null);
  const [route, setRoute] = useState([]);
  const [steps, setSteps] = useState([]);

  const [riskZones, setRiskZones] = useState([]);
  const [safeZones, setSafeZones] = useState([]);

  const safeLat = Number(params.get("slat"));
  const safeLng = Number(params.get("slng"));

  /* 🔴 FETCH ACTIVE RISK ZONES */
  useEffect(() => {
    return onSnapshot(collection(db, "riskZones"), (snap) => {
      const zones = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((z) => z.active === true);
      setRiskZones(zones);
    });
  }, []);

  /* 🟢 FETCH ACTIVE SAFE ZONES */
  useEffect(() => {
    return onSnapshot(collection(db, "safeZones"), (snap) => {
      const zones = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((z) => z.active === true);
      setSafeZones(zones);
    });
  }, []);

  /* 📍 LIVE USER TRACKING */
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLoc({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      console.error,
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  /* 🛣️ FETCH ROAD ROUTE */
  useEffect(() => {
    if (!userLoc) return;

    const fetchRoute = async () => {
      const url = `https://router.project-osrm.org/route/v1/foot/${userLoc.longitude},${userLoc.latitude};${safeLng},${safeLat}?overview=full&geometries=polyline&steps=true`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.routes?.length > 0) {
        setRoute(decodePolyline(data.routes[0].geometry));
        setSteps(data.routes[0].legs[0].steps);
      }
    };

    fetchRoute();
  }, [userLoc, safeLat, safeLng]);

  if (!userLoc) return null;

  return (
    <div style={styles.page}>
      <EmergencyNavbar />

      {/* 🔙 BACK BUTTON */}
      <div style={styles.topBar}>
  <button
    style={styles.backBtn}
    onClick={() => navigate("/")}
  >
    ← Back to Dashboard
  </button>
</div>


      {/* 🗺️ MAP */}
      <div style={styles.mapContainer}>
        <MapContainer
          center={[userLoc.latitude, userLoc.longitude]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 🔴 RISK ZONES */}
          {riskZones.map((z) => (
            <Circle
              key={z.id}
              center={[z.latitude, z.longitude]}
              radius={z.radius}
              pathOptions={{ color: "red", fillOpacity: 0.25 }}
            />
          ))}

          {/* 🟢 SAFE ZONES */}
          {safeZones.map((z) => (
            <Circle
              key={z.id}
              center={[z.latitude, z.longitude]}
              radius={z.radius}
              pathOptions={{ color: "green", fillOpacity: 0.35 }}
            >
              <Popup>Safe Zone</Popup>
            </Circle>
          ))}

          {/* 👤 USER */}
          <Marker position={[userLoc.latitude, userLoc.longitude]}>
            <Popup>You are here</Popup>
          </Marker>

          {/* 🧭 ROUTE */}
          {route.length > 0 && (
            <Polyline
              positions={route}
              pathOptions={{ color: "#2563eb", weight: 6 }}
            />
          )}
        </MapContainer>
      </div>

      {/* 📋 INSTRUCTIONS */}
      <div style={styles.instructions}>
        <h3 style={styles.title}>Navigation Instructions</h3>

        {steps.map((step, i) => (
          <div key={i} style={styles.step}>
            <b>{i + 1}.</b> {stepToText(step)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavigateMap;

/* -----------------------------
   STYLES
----------------------------- */
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    padding: "10px 16px",
    background: "#f1f5f9",
    borderBottom: "1px solid #e5e7eb",
  },
  backBtn: {
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
  },
  mapContainer: {
    height: "50vh",
  },
  instructions: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    background: "#f8fafc",
  },
  title: {
    fontSize: "18px",
    marginBottom: "12px",
    color: "#0f172a",
  },
  step: {
    padding: "10px",
    background: "#ffffff",
    borderRadius: "10px",
    marginBottom: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    fontSize: "14px",
  },
};
