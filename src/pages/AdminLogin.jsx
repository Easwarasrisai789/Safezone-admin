import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists() || snap.data().role !== "admin") {
        alert("Not authorized as Admin");
        return;
      }

      navigate("/admin/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Enter your admin email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      {/* 🔷 NAVBAR */}
      <div style={styles.navbar}>
        <h3 style={styles.navTitle}>Admin Panel</h3>
        <button
          onClick={() => navigate("/")}
          style={styles.navBtn}
        >
          ← User Home
        </button>
      </div>

      {/* 🔐 LOGIN BOX */}
      <div style={styles.page}>
        <div style={styles.box}>
          <h2>🔐 Admin Login</h2>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button
            onClick={handleLogin}
            style={styles.btn}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p style={styles.resetText} onClick={handleResetPassword}>
            Forgot password?
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

/* ---------------- STYLES ---------------- */

const styles = {
  navbar: {
    height: "60px",
    background: "#111827",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 25px",
  },
  navTitle: {
    margin: 0,
    fontSize: "18px",
  },
  navBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: "14px",
  },
  page: {
    minHeight: "calc(100vh - 60px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
  },
  box: {
    background: "#fff",
    padding: "30px",
    width: "320px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  btn: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  resetText: {
    marginTop: "12px",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "14px",
  },
};
