import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminNav from "../components/AdminNav";

/* -------------------------------
   DATE FORMATTER
-------------------------------- */
const formatDateTime = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return "—";

  const date = timestamp.toDate();
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const RiskZonesList = () => {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "riskZones"), (snap) => {
      setZones(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
    return () => unsub();
  }, []);

  const deleteZone = async (id) => {
    if (!window.confirm("Delete this risk zone permanently?")) return;
    await deleteDoc(doc(db, "riskZones", id));
  };

  const toggleActive = async (id, current) => {
    await updateDoc(doc(db, "riskZones", id), {
      active: !current,
    });
  };

  return (
    <div style={styles.layout}>
      <AdminNav />

      <main style={styles.content}>
        <h1 style={styles.title}>🚧 Risk Zones Management</h1>

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.thCenter}>Latitude</th>
                <th style={styles.thCenter}>Longitude</th>
                <th style={styles.thCenter}>Radius (m)</th>
                <th style={styles.th}>Created On</th>
                <th style={styles.thCenter}>Status</th>
                <th style={styles.thCenter}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {zones.length === 0 && (
                <tr>
                  <td colSpan="7" style={styles.empty}>
                    No risk zones found
                  </td>
                </tr>
              )}

              {zones.map((z, index) => {
                const isActive = z.active !== false;

                return (
                  <tr
                    key={z.id}
                    style={{
                      background:
                        index % 2 === 0 ? "#f8fafc" : "#ffffff",
                    }}
                  >
                    <td style={styles.nameCell}>
                      {z.name || "Unnamed Zone"}
                    </td>

                    <td style={styles.centerCell}>{z.latitude}</td>
                    <td style={styles.centerCell}>{z.longitude}</td>
                    <td style={styles.centerCell}>{z.radius}</td>

                    <td style={styles.dateCell}>
                      {formatDateTime(z.createdAt)}
                    </td>

                    <td style={styles.centerCell}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          background: isActive
                            ? "#dcfce7"
                            : "#fee2e2",
                          color: isActive ? "#166534" : "#991b1b",
                        }}
                      >
                        {isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td style={styles.centerCell}>
                      <button
                        style={{
                          ...styles.actionBtn,
                          background: isActive ? "#f59e0b" : "#22c55e",
                        }}
                        onClick={() => toggleActive(z.id, isActive)}
                      >
                        {isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                        onClick={() => deleteZone(z.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default RiskZonesList;

/* --------------------------------------------------
   PROFESSIONAL TABLE STYLES
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

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
    borderBottom: "1px solid #e5e7eb",
    background: "#f1f5f9",
  },

  thCenter: {
    textAlign: "center",
    padding: "14px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
    borderBottom: "1px solid #e5e7eb",
    background: "#f1f5f9",
  },

  nameCell: {
    padding: "12px 14px",
    fontWeight: 600,
    color: "#0f172a",
  },

  centerCell: {
    padding: "12px",
    textAlign: "center",
    fontSize: "14px",
  },

  dateCell: {
    padding: "12px 14px",
    fontSize: "13px",
    color: "#475569",
    whiteSpace: "nowrap",
  },

  statusBadge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
    display: "inline-block",
  },

  actionBtn: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    fontSize: "13px",
    cursor: "pointer",
    marginRight: "6px",
  },

  deleteBtn: {
    background: "#dc2626",
  },

  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#64748b",
    fontSize: "14px",
  },
};
