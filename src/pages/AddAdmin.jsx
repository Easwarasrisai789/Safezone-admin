import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseConfig } from "../firebase";
import AdminNav from "../components/AdminNav";

/* =================================================
   🔐 SECONDARY AUTH INSTANCE
   (prevents current admin from logging out)
================================================= */
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

const AddAdmin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password) {
      setMessage("⚠️ Please fill all fields");
      return;
    }

    if (password.length < 6) {
      setMessage("⚠️ Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create admin in Firebase Authentication (secondary auth)
      const userCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        password
      );

      // 2️⃣ Store admin role in Firestore (UID matched)
      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        role: "admin",
        active: true,
        createdAt: serverTimestamp(),
      });

      setMessage("✅ Admin created successfully");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.layout}>
      <AdminNav />

      <main style={styles.content}>
        <h1 style={styles.title}>Add New Admin</h1>
        <p style={styles.subtitle}>
          Create admin using Authentication + Firestore
        </p>

        <form style={styles.card} onSubmit={handleSubmit}>
          <label style={styles.label}>Admin Email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} disabled={loading}>
            {loading ? "Creating Admin..." : "Create Admin"}
          </button>

          {message && <p style={styles.message}>{message}</p>}
        </form>
      </main>
    </div>
  );
};

export default AddAdmin;

/* ======================================
   PROFESSIONAL ADMIN DASHBOARD STYLES
====================================== */
const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f1f5f9",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  content: {
    flex: 1,
    padding: "40px",
  },

  title: {
    fontSize: "28px",
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: "6px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "24px",
  },

  card: {
    width: "420px",
    backgroundColor: "#ffffff",
    padding: "28px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
  },

  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#334155",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    marginBottom: "16px",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "8px",
  },

  message: {
    marginTop: "14px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#0f172a",
  },
};
