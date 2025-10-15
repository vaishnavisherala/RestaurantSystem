import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    alert("👋 Logged out successfully!");
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "40px",
        backgroundColor: "#1e3a8a",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        zIndex: 2000,
      }}
    >
      {/* Left side (logo / title) */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "20px", fontWeight: "600" }}>🍽️ Our Place Restaurant</span>
      </div>

      {/* Right side (profile icon + dropdown) */}
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "26px",
          }}
        >
          <FaUserCircle />
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "50px",
              right: 0,
              backgroundColor: "white",
              color: "#111827",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              width: "180px",
              overflow: "hidden",
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                fontWeight: "600",
              }}
            >
              👤 {user.username || "Guest"}
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                border: "none",
                background: "white",
                cursor: "pointer",
                fontSize: "15px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f3f4f6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
