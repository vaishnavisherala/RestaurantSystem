import React, { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import { jwtDecode } from "jwt-decode"; // ✅ correct import
import TopBar from "./TopBar";

const Dashboard = () => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const decoded = jwtDecode(token);
    const username = decoded.username || decoded.user || decoded.sub;
    localStorage.setItem("username", username);

    const fetchData = async () => {
      try {
        // Fetch Tables
        const tablesRes = await fetch("https://restaurantsystem-4.onrender.com/api/tables/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tablesData = await tablesRes.json();
        setTables(Array.isArray(tablesData) ? tablesData : tablesData.results || []);

        // Fetch Orders
        const ordersRes = await fetch("https://restaurantsystem-4.onrender.com/api/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.results || []);

        // Fetch Users to confirm SuperAdmin
        const userRes = await fetch("https://restaurantsystem-4.onrender.com/api/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          const userArray = Array.isArray(userData) ? userData : [userData];
          setUsers(userArray);

          const currentUser = userArray.find((u) => u.username === username);
          setIsSuperAdmin(currentUser?.is_superuser || false);
        } else {
          setIsSuperAdmin(false);
        }

        setLoading(false);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  if (!isSuperAdmin) {
    return (
      <div style={{ textAlign: "center", marginTop: "150px", fontSize: "20px", color: "red" }}>
        ❌ Access Denied — SuperAdmin Only
      </div>
    );
  }

  // --- CALCULATIONS ---
  const freeTables = tables.filter((t) => t.status === "available").length;
  const inPlaceOrders = orders.filter((o) => o.table).length;
  const deliveryOrders = orders.filter((o) => !o.table).length;
  const activeOrders = orders.length;

  const statCards = [
    { title: "Free Tables", value: freeTables, color: "#f59e0b" },
    { title: "In Place Orders", value: inPlaceOrders, color: "#f59e0b" },
    { title: "Delivery Orders", value: deliveryOrders, color: "#f59e0b" },
    { title: "Active Orders", value: activeOrders, color: "#f59e0b" },
  ];

  const latestInPlaceOrders = orders
    .filter((o) => o.table)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const latestDeliveryOrders = orders
    .filter((o) => !o.table)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // --- RETURN UI ---
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
    {/* --- Sidebar --- */}
    <div style={{ width: "250px", flexShrink: 0 }}>
      <Sidebar />
    </div>

    {/* --- Main Content --- */}
    <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <TopBar />

      <main style={{ flex: 1, padding: "30px" }}>
        <h1 style={{ color: "#1e40af", marginBottom: "20px", fontSize: "28px" }}>Dashboard</h1>

        {/* --- Stat Cards --- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.title}
              style={{
                backgroundColor: card.color,
                color: "#fff",
                padding: "20px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <h2 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>{card.value}</h2>
              <p style={{ margin: 0, fontSize: "14px" }}>{card.title}</p>
            </div>
          ))}
        </div>

        {/* --- In-Place Orders --- */}
        <h2 style={{ color: "#1e40af" }}>In-Place Orders</h2>
        {latestInPlaceOrders.length > 0 ? (
          <div style={{ overflowX: "auto", marginBottom: "30px" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Table</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {latestInPlaceOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{typeof o.user === "object" ? o.user.username : o.user}</td>
                    <td>{o.table?.number || "N/A"}</td>
                    <td>{Number(o.total_price || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#6b7280" }}>No in-place orders found.</p>
        )}

        {/* --- Delivery Orders --- */}
        <h2 style={{ color: "#1e40af" }}>Delivery Orders</h2>
        {latestDeliveryOrders.length > 0 ? (
          <div style={{ overflowX: "auto", marginBottom: "30px" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Client</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {latestDeliveryOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{typeof o.user === "object" ? o.user.username : o.user}</td>
                    <td>{Number(o.total_price || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#6b7280" }}>No delivery orders found.</p>
        )}

        {/* --- Users --- */}
        <h2 style={{ color: "#1e40af" }}>Users</h2>
        {users.length > 0 ? (
          <div style={{ overflowX: "auto", marginBottom: "30px" }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "#6b7280" }}>No users found.</p>
        )}
      </main>
    </div>
  </div>

  );
};

export default Dashboard;
