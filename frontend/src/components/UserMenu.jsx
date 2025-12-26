import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";



export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={styles.wrapper} ref={menuRef}>
      {/* Avatar Button */}
      <div
        style={{
          ...styles.avatar,
          transform: open ? "scale(1.05)" : "scale(1)"
        }}
        onClick={() => setOpen(!open)}
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
      >
        {user?.name?.charAt(0)?.toUpperCase() || "U"}
      </div>

      {/* Dropdown */}
      <div
        style={{
          ...styles.dropdown,
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-10px)",
          pointerEvents: open ? "auto" : "none"
        }}
      >
        <div style={styles.info}>
          <strong>{user?.name || "User"}</strong>
          <span style={styles.role}>{role || "USER"}</span>
        </div>

        <button
          style={styles.logoutBtn}
          onClick={logout}
          onMouseEnter={(e) =>
            (e.target.style.background = "#dc2626")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "#ef4444")
          }
        >
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    top: 30,
    right: 40,          // ✅ FULL RIGHT
    zIndex: 2000
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
    color: "white",
    fontWeight: 600,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    userSelect: "none",
    boxShadow: "0 12px 28px rgba(0,0,0,0.25)",
    transition: "all 0.2s ease"
  },

  dropdown: {
    position: "absolute",
    top: 52,            // ✅ DROPDOWN BELOW AVATAR
    right: 0,           // ✅ ALIGNED TO RIGHT
    background: "white",
    borderRadius: 14,
    boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
    width: 200,
    overflow: "hidden",
    transition: "all 0.25s ease"
  },

  info: {
    padding: "14px 16px",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 14,
    display: "flex",
    flexDirection: "column",
    gap: 4
  },

  role: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase"
  },

  logoutBtn: {
    width: "100%",
    padding: "12px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.2s ease"
  }
};
