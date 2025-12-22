import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import AdminNav from "../components/AdminNav";

import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* --------------------------------------------------
   FIX LEAFLET DEFAULT ICON
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

/* 🔵 Blue dot icon */
const userIcon = new L.DivIcon({
  className: "blue-dot",
  html: `<div class="dot"></div>`
});

/* 📏 Distance in METERS (matches RiskZone.jsx) */
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 == null || lon1 == null ||
    lat2 == null || lon2 == null
  ) return Infinity;

  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ✅ Validate coordinates */
const isValidCoord = (lat, lng) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  !isNaN(lat) &&
  !isNaN(lng);

export default function UsersZonesAlert() {
  const [zones, setZones] = useState([]);
  const [users, setUsers] = useState([]);

  /* 🔴 READ RISK ZONES (ADMIN ADDED) */
  useEffect(() => {
    return onSnapshot(collection(db, "riskZones"), snap => {
      const cleanZones = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(z =>
          z.active === true &&
          isValidCoord(z.latitude, z.longitude) &&
          Number(z.radius) > 0
        );

      setZones(cleanZones);
    });
  }, []);

  /* 👤 READ LIVE USERS */
  useEffect(() => {
    return onSnapshot(collection(db, "liveUsers"), snap => {
      const cleanUsers = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => isValidCoord(u.latitude, u.longitude));

      setUsers(cleanUsers);
    });
  }, []);

  /* 🔵 USERS INSIDE RED RISK ZONES */
  const usersInRisk = users.filter(user =>
    zones.some(zone => {
      const dist = getDistanceMeters(
        user.latitude,
        user.longitude,
        zone.latitude,
        zone.longitude
      );
      return dist <= zone.radius;
    })
  );

  return (
    <>
      {/* ---------- INLINE CSS ---------- */}
      <style>{`
        .layout {
          display: flex;
          height: 100vh;
          background: #f8fafc;
          font-family: Inter, system-ui, sans-serif;
        }

        .map-wrapper {
          flex: 1;
          position: relative;
        }

        .header {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 10px 22px;
          border-radius: 14px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          z-index: 1000;
          font-weight: 600;
        }

        .header span {
          color: #2563eb;
        }

        .blue-dot .dot {
          width: 14px;
          height: 14px;
          background: #2563eb;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 0 14px rgba(37,99,235,0.9);
          animation: pulse 1.8s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }

        .leaflet-container {
          height: 100%;
          width: 100%;
        }
      `}</style>

      <div className="layout">
        <AdminNav />

        <div className="map-wrapper">
          <div className="header">
            🚨 Users Inside Risk Zones: <span>{usersInRisk.length}</span>
          </div>

          <MapContainer
            center={[16.5062, 80.648]}
            zoom={12}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* 🔴 RED RISK ZONES (SAME AS ADMIN PAGE) */}
            {zones.map(z => (
              <Circle
                key={z.id}
                center={[z.latitude, z.longitude]}
                radius={z.radius}  // METERS
                pathOptions={{
                  color: "#dc2626",
                  weight: 3,
                  fillColor: "#ef4444",
                  fillOpacity: 0.35
                }}
              />
            ))}

            {/* 🔵 USERS INSIDE THOSE ZONES */}
            {usersInRisk.map(u => (
              <Marker
                key={u.id}
                position={[u.latitude, u.longitude]}
                icon={userIcon}
              >
                <Popup>
                  <b>User ID:</b> {u.id}<br />
                  ⚠ Inside Risk Zone
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </>
  );
}
