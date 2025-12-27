import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import LiveUsers from "./pages/LiveUsers";
import RiskZone from "./pages/RiskZone";
import RiskZonesList from "./pages/RiskZonesList";
import RiskZoneEffects from "./pages/RiskZoneEffects";
import AddSafeZones from "./pages/AddSafeZones";
import UsersZonesAlert from "./pages/UsersZonesAlert";
import NavigateMap from "./pages/NavigateMap";
import Reports from "./pages/Reports";
import AddAdmin from "./pages/AddAdmin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔥 DEFAULT: ADMIN LOGIN */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />

        {/* ADMIN AUTH */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN DASHBOARD */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/live-users" element={<LiveUsers />} />
        <Route path="/admin/add-risk-zone" element={<RiskZone />} />
        <Route path="/admin/risk-zones" element={<RiskZonesList />} />
        <Route path="/admin/risk-zone-effects" element={<RiskZoneEffects />} />
        <Route path="/admin/add-safe-zone" element={<AddSafeZones />} />
        <Route path="/admin/UsersZonesAlert" element={<UsersZonesAlert />} />
        <Route path="/admin/Reports" element={<Reports />} />
        <Route path="/admin/AddAdmin" element={<AddAdmin />} />

        {/* MAP (USED BY ADMIN NAVIGATION) */}
        <Route path="/navigate" element={<NavigateMap />} />

        {/* ❌ BLOCK USER HOME IN ADMIN DEPLOY */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
