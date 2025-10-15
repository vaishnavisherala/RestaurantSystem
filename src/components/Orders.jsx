import React, { useEffect, useState } from "react";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [formData, setFormData] = useState({});

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("No token found");

      const response = await fetch("http://192.168.0.198:8000/api/orders/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to fetch orders");
      }

      const data = await response.json();
      const ordersArray = Array.isArray(data) ? data : data.results || [];
      setOrders(ordersArray);

      // Initialize form data
      const initialFormData = {};
      ordersArray.forEach((order) => {
        initialFormData[order.id] = { name: "", phone_number: "" };
      });
      setFormData(initialFormData);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (orderId) => {
    const { name, phone_number } = formData[orderId] || {};
    if (!name || !phone_number) {
      alert("Please enter name and phone number");
      return;
    }

    if (!window.confirm("Are you sure you want to complete checkout for this order?")) return;

    setProcessing(orderId);
    try {
      const token = localStorage.getItem("access");
      if (!token) throw new Error("No token found");

      const response = await fetch(
        `http://192.168.0.198:8000/api/orders/${orderId}/checkout/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, phone_number }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.detail || "Checkout failed");
      }

      alert("✅ Payment successful and table released!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <p style={{ marginLeft: "250px" }}>Loading orders...</p>;
  if (error) return <p style={{ color: "red", marginLeft: "250px" }}>{error}</p>;
  if (orders.length === 0) return <p style={{ marginLeft: "250px" }}>No orders found.</p>;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      {/* Sidebar (fixed) */}
      <SideBar />
      <TopBar/>

      {/* Main Content */}
      <div
        style={{
          flexGrow: 1,
          padding: "20px",
          marginTop:"30px",
          marginRight: "500px",
          transition: "margin-left 0.3s ease",
        }}
      >
        <h1 style={{ color: "#1e40af", marginBottom: "20px" }}>All Orders</h1>

        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
            }}
          >
            <p>
              <strong>Order ID:</strong> {order.id}
            </p>
            <p>
              <strong>User:</strong>{" "}
              {typeof order.user === "object" ? order.user.username : order.user}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: order.status === "completed" ? "green" : "orange",
                  fontWeight: "bold",
                }}
              >
                {order.status}
              </span>
            </p>
            <p>
              <strong>Table:</strong>{" "}
              {order.table ? `#${order.table.number}` : "N/A"}
            </p>
            <p>
              <strong>Name:</strong> {order.name || "N/A"}
            </p>

            <p>
              <strong>Items:</strong>
            </p>
            <ul style={{ paddingLeft: "20px" }}>
              {(order.items || []).map((oi) => (
                <li key={oi.id}>
                  {oi.item?.name || "Unknown"} — Qty: {oi.quantity} — ₹
                  {Number(oi.item?.price || 0).toFixed(2)}
                </li>
              ))}
            </ul>

            <p style={{ fontWeight: "bold" }}>
              Total: ₹{Number(order.total_price || 0).toFixed(2)}
            </p>
            <p>
              <strong>Created at:</strong>{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>

            {/* Checkout for pending orders */}
            {order.status === "pending" && (
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  placeholder="Name"
                  value={formData[order.id]?.name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [order.id]: {
                        ...formData[order.id],
                        name: e.target.value,
                      },
                    })
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    flex: "1 1 200px",
                  }}
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={formData[order.id]?.phone_number || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [order.id]: {
                        ...formData[order.id],
                        phone_number: e.target.value,
                      },
                    })
                  }
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    flex: "1 1 200px",
                  }}
                />
                <button
                  onClick={() => handleCheckout(order.id)}
                  disabled={processing === order.id}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#16a34a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {processing === order.id
                    ? "Processing..."
                    : "Checkout (Complete Payment)"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
