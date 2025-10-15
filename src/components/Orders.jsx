import React, { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null); // Track which order is being checked out
  const [formData, setFormData] = useState({}); // store name and phone per order

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch orders from API
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

      // Initialize formData for each order
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

  // Checkout order
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
      fetchOrders(); // Refresh order list
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>All Orders</h1>

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "15px",
            backgroundColor: "#f9fafb",
          }}
        >
          <p><strong>Order ID:</strong> {order.id}</p>
          <p><strong>User:</strong> {typeof order.user === "object" ? order.user.username : order.user}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Table:</strong> {order.table ? `#${order.table.number}` : "N/A"}</p>
          <p><strong>Name:</strong> {order.name || "N/A"}</p>

          <p><strong>Items:</strong></p>
          <ul>
            {(order.items || []).map((oi) => (
              <li key={oi.id}>
                {oi.item?.name || "Unknown"} — Qty: {oi.quantity} — Rs {Number(oi.item?.price || 0).toFixed(2)}
              </li>
            ))}
          </ul>

          <p style={{ fontWeight: "bold" }}>Total: Rs {Number(order.total_price || 0).toFixed(2)}</p>
          <p><strong>Created at:</strong> {new Date(order.created_at).toLocaleString()}</p>

          {/* Show checkout form only for pending orders */}
          {order.status === "pending" && (
            <div style={{ marginTop: "10px" }}>
              <input
                type="text"
                placeholder="Name"
                value={formData[order.id]?.name || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [order.id]: { ...formData[order.id], name: e.target.value },
                  })
                }
                style={{ marginRight: "10px", padding: "5px" }}
              />
              <input
                type="text"
                placeholder="Phone"
                value={formData[order.id]?.phone_number || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [order.id]: { ...formData[order.id], phone_number: e.target.value },
                  })
                }
                style={{ marginRight: "10px", padding: "5px" }}
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
                }}
              >
                {processing === order.id ? "Processing..." : "Checkout (Complete Payment)"}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Orders;
