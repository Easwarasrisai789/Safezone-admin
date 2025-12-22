import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-title">
        <span className="navbar-indicator"></span>
        Safe Zone System
      </div>

      <div className="navbar-actions">
        <button
          className="admin-btn"
          onClick={() => navigate("/admin/login")}
        >
          Admin Login
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
