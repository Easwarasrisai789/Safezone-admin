import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1oy9QjAeA2xcPKLri5obDxtnwwwc4C9Q",
  authDomain: "qrhelp-x.firebaseapp.com",
  projectId: "qrhelp-x",
  storageBucket: "qrhelp-x.firebasestorage.app",
  messagingSenderId: "563340626732",
  appId: "1:563340626732:web:382688d6f3783a43df7a89"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firestore (THIS WAS MISSING)
export const db = getFirestore(app);
export const auth = getAuth(app);
export { firebaseConfig };