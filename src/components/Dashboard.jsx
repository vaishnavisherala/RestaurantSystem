import React, { useEffect, useState } from "react";
import Sidebar from "./SideBar";
import TopBar from "./TopBar";
import { jwtDecode } from "jwt-decode";

const Dashboard = () => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }

    const decoded = jwtDecode(token);
    const username = decoded.username || decoded.user || decoded.sub;
    localStorage.setItem("username", username);

    const fetchData = async () => {
      try {
        const baseURL = "https://restaurantsystem-4.onrender.com/api";

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // --- Fetch Tables ---
        const tablesRes = await fetch(`${baseURL}/tables/`, { headers });
        const tablesData = await tablesRes.json();
        setTables(Array.isArray(tablesData) ? tablesData : tablesData.results || []);

        // --- Fetch Orders ---
        const ordersRes = await fetch(`${baseURL}/orders/`, { headers });
        const ordersData = await ordersRes.json();
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.results || []);

        // --- Fetch Users (to check if current user is SuperAdmin) ---
        const usersRes = await fetch(`${baseURL}/users/`, { headers });
        if (usersRes.ok) {
          const userData = await usersRes.json();
          const userArray = Array.isArray(userData) ? userData : [userData];
          setUsers(userArray);

          const currentUser = userArray.find((u) => u.username === username);
          setIsSuperAdmin(currentUser?.is_superuser || false);
        } else {
          setIsSuperAdmin(false);
        }

      } catch (error) {
        console.error("❌ Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "150px" }}>Loading dashboard...</p>;
  }

  if (!isSuperAdmin) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "150px",
          fontSize: "20px",
          color: "red",
        }}
      >
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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <TopBar />
      <div style={{ flex: 1, padding: "20px", marginTop: "30px" }}>
        <h1 style={{ color: "#1e40af", marginBottom: "20px" }}>Dashboard</h1>

        {/* --- Stat Cards --- */}
        <div
          style={{
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

        {/* --- In-Place Orders --- */}
        <h2>In-Place Orders</h2>
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table style={tableStyle}>
            <thead style={{ backgroundColor: "#f3f4f6" }}>
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

        {/* --- Delivery Orders --- */}
        <h2>Delivery Orders</h2>
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table style={tableStyle}>
            <thead style={{ backgroundColor: "#f3f4f6" }}>
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

        {/* --- Users Table --- */}
        <h2>Users</h2>
        <div style={{ overflowX: "auto", marginBottom: "30px" }}>
          <table style={tableStyle}>
            <thead style={{ backgroundColor: "#f3f4f6" }}>
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
      </div>
    </div>
  );
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

export default Dashboard;
