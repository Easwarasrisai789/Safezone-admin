import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /* 🚪 Logout */
  const logout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  /* Active button style */
  const isActive = (path) =>
    location.pathname === path
      ? styles.activeBtn
      : styles.sideBtn;

  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.sidebarTitle}>Admin Panel</h2>

      {/* =========================
          📊 OVERVIEW
      ========================= */}
      <button
        style={isActive("/admin/dashboard")}
        onClick={() => navigate("/admin/dashboard")}
      >
        Dashboard Overview
      </button>

      <button
        style={isActive("/admin/live-users")}
        onClick={() => navigate("/admin/live-users")}
      >
        Live Users
      </button>

      <hr style={styles.divider} />

      {/* =========================
          🚧 ZONE CREATION
      ========================= */}
      <button
        style={isActive("/admin/add-risk-zone")}
        onClick={() => navigate("/admin/add-risk-zone")}
      >
        Add Risk Zone
      </button>

      <button
        style={isActive("/admin/add-safe-zone")}
        onClick={() => navigate("/admin/add-safe-zone")}
      >
        Add Safe Zone
      </button>

      <hr style={styles.divider} />

      {/* =========================
          🗂️ ZONE MANAGEMENT
      ========================= */}
      <button
        style={isActive("/admin/risk-zones")}
        onClick={() => navigate("/admin/risk-zones")}
      >
        Risk Zones (Manage)
      </button>

      <button
        style={isActive("/admin/risk-zone-effects")}
        onClick={() => navigate("/admin/risk-zone-effects")}
      >
        Risk Zone Effects
      </button>

      <button
        style={isActive("/admin/UsersZonesAlert")}
        onClick={() => navigate("/admin/UsersZonesAlert")}
      >
        Users in Zones
      </button>

      <hr style={styles.divider} />

      {/* =========================
          📑 REPORTS & ALERTS
      ========================= */}
      

      <button
        style={isActive("/admin/reports")}
        onClick={() => navigate("/admin/reports")}
      >
        Reports
      </button>
      <button
        style={isActive("/admin/AddAdmin")}
        onClick={() => navigate("/admin/AddAdmin")}
      >
        ADD ADMIN
      </button>

      {/* =========================
          🚪 FOOTER ACTIONS
      ========================= */}
      <div style={styles.sidebarFooter}>
        <button onClick={() => navigate("/")} style={styles.homeBtn}>
          User Home
        </button>

        <button onClick={logout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminNav;

/* ---------------- STYLES ---------------- */

const styles = {
  sidebar: {
    width: "260px",
    background: "#0f172a",
    color: "#fff",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },

  sidebarTitle: {
    fontSize: "22px",
    marginBottom: "24px",
    fontWeight: 600,
  },

  sideBtn: {
    background: "transparent",
    border: "none",
    color: "#cbd5f5",
    padding: "12px 16px",
    marginBottom: "6px",
    textAlign: "left",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
  },

  activeBtn: {
    background: "#1e293b",
    color: "#ffffff",
    padding: "12px 16px",
    marginBottom: "6px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
  },

  divider: {
    margin: "14px 0",
    borderColor: "#1e293b",
  },

  sidebarFooter: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  homeBtn: {
    background: "#2563eb",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 500,
  },

  logoutBtn: {
    background: "#ef4444",
    border: "none",
    padding: "10px",
    borderRadius: "10px",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 500,
  },
};
