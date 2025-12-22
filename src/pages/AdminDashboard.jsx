import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

/* 📊 Charts */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import AdminNav from "../components/AdminNav";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [liveUsers, setLiveUsers] = useState(0);
  const [usersToday, setUsersToday] = useState(0);
  const [activeAdmins, setActiveAdmins] = useState(0);
  const safeZonesToday = 5;

  /* 🔐 Protect route */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/admin/login");
    });
    return () => unsub();
  }, [navigate]);

  /* 📍 Live users */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "liveUsers"), (snap) => {
      setLiveUsers(snap.size);
      setUsersToday(snap.size);
    });
    return () => unsub();
  }, []);

  /* 👮 Active admins */
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const unsub = onSnapshot(q, (snap) => {
      setActiveAdmins(snap.size);
    });
    return () => unsub();
  }, []);

  const barData = {
    labels: ["Live Users", "Users Today", "Safe Zones", "Active Admins"],
    datasets: [
      {
        label: "System Overview",
        data: [liveUsers, usersToday, safeZonesToday, activeAdmins],
        backgroundColor: ["#2563eb", "#16a34a", "#f59e0b", "#7c3aed"],
        borderRadius: 10,
      },
    ],
  };

  const pieData = {
    labels: ["Live Users", "Admins", "Safe Zones"],
    datasets: [
      {
        data: [liveUsers, activeAdmins, safeZonesToday],
        backgroundColor: ["#2563eb", "#7c3aed", "#f59e0b"],
      },
    ],
  };

  return (
    <div style={styles.layout}>
      {/* ✅ Separate Admin Navbar */}
      <AdminNav />

      {/* 📊 MAIN CONTENT */}
      <main style={styles.content}>
        <h1 style={styles.pageTitle}>Dashboard Overview</h1>
        <p style={styles.subtitle}>
          Live analytics of emergency response system
        </p>

        <div style={styles.chartGrid}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>System Overview</h3>
            <Bar data={barData} />
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Distribution</h3>
            <Pie data={pieData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

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
  },
  subtitle: {
    color: "#64748b",
    marginBottom: "28px",
    fontSize: "15px",
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "26px",
  },
  chartCard: {
    background: "#ffffff",
    padding: "26px",
    borderRadius: "18px",
    boxShadow: "0 14px 30px rgba(0,0,0,0.06)",
  },
  chartTitle: {
    marginBottom: "14px",
    color: "#0f172a",
  },
};
