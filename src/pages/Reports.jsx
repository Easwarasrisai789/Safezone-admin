import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import AdminNav from "../components/AdminNav";

const Reports = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "feedbackReports"),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snap) => {
      setReports(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
  }, []);

  return (
    <div style={styles.layout}>
      <AdminNav />

      <main style={styles.content}>
        <h1 style={styles.title}>📊 User Feedback Reports</h1>

        {reports.length === 0 && (
          <p style={{ color: "#64748b" }}>No feedback received yet</p>
        )}

        <div style={styles.grid}>
          {reports.map((r) => (
            <div key={r.id} style={styles.card}>
              <p><b>User:</b> {r.uid}</p>
              <p><b>Type:</b> {r.type}</p>
              <p style={styles.msg}>{r.message}</p>
              <p style={styles.time}>
                {r.createdAt?.toDate().toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Reports;

/* ---------------- STYLES ---------------- */

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
  },
  content: {
    flex: 1,
    padding: "30px",
  },
  title: {
    fontSize: "26px",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
  },
  msg: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#334155",
  },
  time: {
    marginTop: "10px",
    fontSize: "12px",
    color: "#64748b",
  },
};
