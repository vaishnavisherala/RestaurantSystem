import React, { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import { jwtDecode } from "jwt-decode"; // ✅ correct import

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
        const tablesRes = await fetch("http://192.168.0.198:8000/api/tables/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tablesData = await tablesRes.json();
        setTables(Array.isArray(tablesData) ? tablesData : tablesData.results || []);

        // Fetch Orders
        const ordersRes = await fetch("http://192.168.0.198:8000/api/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.results || []);

        // Fetch Users to confirm SuperAdmin
        const userRes = await fetch("http://192.168.0.198:8000/api/users/", {
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
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "20px", marginRight: "500px" }}>
        <h1 style={{ marginBottom: "20px" }}>Dashboard</h1>
        {/* Stat Cards */}
        <div
          style={{
            width: "1000px",
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          {statCards.map((card) => (
            <div
              key={card.title}
              style={{
                flex: "1 1 calc(25% - 20px)",
                backgroundColor: card.color,
                color: "#fff",
                padding: "20px",
                borderRadius: "10px",
                textAlign: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>{card.value}</h3>
              <p style={{ margin: 0 }}>{card.title}</p>
            </div>
          ))}
        </div>

        
        {/* All In-Place Orders */}
        <h2>In-Place Orders</h2>
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <thead style={{ backgroundColor: "#f3f4f6" }}>
              <tr>
                <th style={{ padding: "10px" }}>Order ID</th>
                <th style={{ padding: "10px" }}>Client</th>
                <th style={{ padding: "10px" }}>Table</th>
                <th style={{ padding: "10px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {latestInPlaceOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "10px" }}>{o.id}</td>
                  <td style={{ padding: "10px" }}>
                    {typeof o.user === "object" ? o.user.username : o.user}
                  </td>
                  <td style={{ padding: "10px" }}>{o.table?.number || "N/A"}</td>
                  <td style={{ padding: "10px" }}> {Number(o.total_price || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* All Delivery Orders */}
        <h2>Delivery Orders</h2>
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <thead style={{ backgroundColor: "#f3f4f6" }}>
              <tr>
                <th style={{ padding: "10px" }}>Order ID</th>
                <th style={{ padding: "10px" }}>Client</th>
                <th style={{ padding: "10px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {latestDeliveryOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "10px" }}>{o.id}</td>
                  <td style={{ padding: "10px" }}>
                    {typeof o.user === "object" ? o.user.username : o.user}
                  </td>
                  <td style={{ padding: "10px" }}> {Number(o.total_price || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


        {/* Users Table */}
        <h2>Users</h2>
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <thead style={{ backgroundColor: "#f3f4f6" }}>
              <tr>
                <th style={{ padding: "10px" }}>ID</th>
                <th style={{ padding: "10px" }}>Username</th>
                <th style={{ padding: "10px" }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "10px" }}>{u.id}</td>
                  <td style={{ padding: "10px" }}>{u.username}</td>
                  <td style={{ padding: "10px" }}>{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
