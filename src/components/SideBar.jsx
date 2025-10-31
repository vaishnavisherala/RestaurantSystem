import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaShoppingCart, FaBox } from "react-icons/fa";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // ✅ Responsive sidebar style
  const sidebarStyle = {
    position: "fixed",
    top: "40px",
    left: 0,
    height: "100vh",
    width: isOpen ? "240px" : "0",
    backgroundColor: "#1f2937",
    color: "#fff",
    overflowX: "hidden",
    transition: "width 0.3s ease",
    zIndex: 90,
    boxShadow: isOpen ? "2px 0 8px rgba(0,0,0,0.2)" : "none",
  };

  

  const ulStyle = {
    listStyle: "none",
    padding: "16px 0",
    margin: 0,
  };

  const liStyle = {
    marginBottom: "8px",
  };

  const linkStyle = {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    color: "#fff",
    textDecoration: "none",
    transition: "background-color 0.2s",
    fontSize: "16px",
  };

  const iconStyle = {
    marginRight: "12px",
  };

  // ✅ Responsive container for toggle button
  const topBarStyle = {
    flexGrow: 1,
    marginLeft: isOpen ? "240px" : "0",
    transition: "margin-left 0.3s ease",
  };

  const buttonContainerStyle = {
    padding: "12px 16px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 10,
    display: "flex",
    alignItems: "center",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    marginTop: "30px",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "20px",
    transition: "background-color 0.2s",
  };

  // ✅ Mobile Responsive Adjustments via inline CSS media query
  const responsiveStyle = `
    @media (max-width: 768px) {
      .sidebar {
        width: ${isOpen ? "180px" : "0"} !important;
      }
      .topbar {
        margin-left: 0 !important;
      }
      button {
        font-size: 18px !important;
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: ${isOpen ? "160px" : "0"} !important;
      }
      a {
        font-size: 14px !important;
        padding: 10px 16px !important;
      }
    }
  `;

  return (
    <>
      {/* Responsive Style Tag */}
      <style>{responsiveStyle}</style>

      {/* Main content with toggle button */}
      <div style={topBarStyle} className="topbar">
        <div style={buttonContainerStyle}>
          <button
            style={buttonStyle}
            onClick={toggleSidebar}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e5e7eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div style={sidebarStyle} className="sidebar">
        {isOpen && (
          <>
            <ul style={ulStyle}>
              <li style={liStyle}>
                <Link
                  to="/Dashboard"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#374151";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FaHome style={iconStyle} /> Dashboard
                </Link>
              </li>
              <li style={liStyle}>
                <Link
                  to="/Orders"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#374151";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FaShoppingCart style={iconStyle} /> Orders
                </Link>
              </li>
              <li style={liStyle}>
                <Link
                  to="/Home"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#374151";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FaBox style={iconStyle} /> Products
                </Link>
              </li>
               <li style={liStyle}>
                <Link
                  to="/Users"
                  style={linkStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#374151";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <FaBox style={iconStyle} /> Users
                </Link>
              </li>
            </ul>
          </>
        )}
      </div>
    </>
  );
};

export default SideBar;
