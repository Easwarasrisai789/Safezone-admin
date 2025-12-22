import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import AdminNav from "../components/AdminNav";

const RiskZoneEffects = () => {
  const [activeZones, setActiveZones] = useState([]);
  const [inactiveZones, setInactiveZones] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "riskZones"), (snap) => {
      const zones = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setActiveZones(zones.filter((z) => z.active !== false));
      setInactiveZones(zones.filter((z) => z.active === false));
    });

    return () => unsub();
  }, []);

  return (
    <div style={styles.layout}>
      <AdminNav />

      <main style={styles.content}>
        <h1 style={styles.title}>🚦 Risk Zone Effects</h1>

        <div style={styles.tablesGrid}>
          {/* ACTIVE ZONES TABLE */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>🟢 Active Risk Zones</h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Zone Name</th>
                  <th style={styles.thCenter}>Radius</th>
                  <th style={styles.thCenter}>Status</th>
                </tr>
              </thead>

              <tbody>
                {activeZones.length === 0 && (
                  <tr>
                    <td colSpan="3" style={styles.empty}>
                      No active risk zones
                    </td>
                  </tr>
                )}

                {activeZones.map((z) => (
                  <tr key={z.id}>
                    <td style={styles.nameCell}>
                      {z.name || "Unnamed Zone"}
                    </td>
                    <td style={styles.centerCell}>
                      {z.radius || 10000} m
                    </td>
                    <td style={styles.centerCell}>
                      <span style={{ ...styles.badge, ...styles.active }}>
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* INACTIVE ZONES TABLE */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>⚪ Inactive Risk Zones</h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Zone Name</th>
                  <th style={styles.thCenter}>Radius</th>
                  <th style={styles.thCenter}>Status</th>
                </tr>
              </thead>

              <tbody>
                {inactiveZones.length === 0 && (
                  <tr>
                    <td colSpan="3" style={styles.empty}>
                      No inactive risk zones
                    </td>
                  </tr>
                )}

                {inactiveZones.map((z) => (
                  <tr key={z.id}>
                    <td style={styles.nameCell}>
                      {z.name || "Unnamed Zone"}
                    </td>
                    <td style={styles.centerCell}>
                      {z.radius || 10000} m
                    </td>
                    <td style={styles.centerCell}>
                      <span style={{ ...styles.badge, ...styles.inactive }}>
                        INACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskZoneEffects;

/* --------------------------------------------------
   CLEAN ADMIN TABLE UI
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
    fontWeight: 600,
    marginBottom: "20px",
    color: "#0f172a",
  },

  tablesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "14px",
    color: "#0f172a",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
    borderBottom: "1px solid #e5e7eb",
    background: "#f1f5f9",
  },

  thCenter: {
    textAlign: "center",
    padding: "12px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
    borderBottom: "1px solid #e5e7eb",
    background: "#f1f5f9",
  },

  nameCell: {
    padding: "12px",
    fontWeight: 500,
    color: "#0f172a",
  },

  centerCell: {
    padding: "12px",
    textAlign: "center",
    fontSize: "14px",
  },

  badge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
  },

  active: {
    background: "#dcfce7",
    color: "#166534",
  },

  inactive: {
    background: "#fee2e2",
    color: "#991b1b",
  },

  empty: {
    textAlign: "center",
    padding: "24px",
    color: "#64748b",
    fontSize: "14px",
  },
};
