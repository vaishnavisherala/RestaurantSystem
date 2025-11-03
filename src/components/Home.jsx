import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./SideBar";
import TopBar from "./TopBar";

const Home = () => {
  const [items, setItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- Add to Cart ---
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  // --- Remove from Cart ---
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // --- Change Quantity ---
  const changeQuantity = (id, amount) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      )
    );
  };

  // --- Total Price ---
  const totalPrice = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0
  );

  // --- Fetch Menu & Tables ---
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchItemsAndTables();
  }, [navigate]);

  const fetchItemsAndTables = async () => {
    try {
      const token = localStorage.getItem("access");
      const [itemsRes, tablesRes] = await Promise.all([
        fetch("https://restaurantsystem-4.onrender.com/api/items/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("https://restaurantsystem-4.onrender.com/api/tables/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const itemsData = await itemsRes.json();
      const tablesData = await tablesRes.json();

      const itemsArray = Array.isArray(itemsData)
        ? itemsData
        : itemsData.results || [];

      setItems(itemsArray);

      // ✅ Only include available tables
      const availableTables = Array.isArray(tablesData)
        ? tablesData.filter((t) => t.status === "available")
        : [];
      setTables(availableTables);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // --- PLACE ORDER ---
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    if (!selectedTable) {
      alert("Please select a table before placing an order!");
      return;
    }

    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://restaurantsystem-4.onrender.com/api/orders/place_order/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            table_id: selectedTable,
            items: cart.map((i) => ({ item_id: i.id, quantity: i.quantity })),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to place order");
      await response.json();

      alert("✅ Order placed successfully! Table booked.");
      setCart([]);
      setSelectedTable(null);

      // ✅ Refresh tables after booking so booked tables disappear
      fetchItemsAndTables();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <TopBar/>
      <div
        style={{
          flex: 1,
          padding: "50px 100px 40px 20px",
          backgroundColor: "#f9fafb",
        }}
      >
 <h1 style={{color:'#f59e0b'}}>Welcome to Our Place Restro</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "24px",
            maxWidth: "1200px",
            marginTop:"30px"
          }}
        >
          {Array.isArray(items) && items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                  padding: "24px",
                  transition: "box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                <h5
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    margin: "0 0 8px 0",
                    color: "#1f2937",
                  }}
                >
                  {item.name}
                </h5>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    margin: "0 0 16px 0",
                    lineHeight: "1.5",
                  }}
                >
                  {item.description}
                </p>
                <h6
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    margin: "0 0 16px 0",
                    color: "#1f2937",
                  }}
                >
                   Rs {Number(item.price || 0).toFixed(2)}
                </h6>
                <button
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600",
                    transition: "background-color 0.2s ease",
                  }}
                  onClick={() => addToCart(item)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }}
                >
                  Add to Cart
                </button>
              </div>
            ))
          ) : (
            <p>No items found.</p>
          )}
        </div>
      </div>

      {/* CART */}
      {cart.length > 0 && (
        <div
          style={{
            position: "fixed",
            right: "0",
            top: "0",
            width: "380px",
            height: "100vh",
            backgroundColor: "#ffffff",
            boxShadow: "-4px 0 12px rgba(0,0,0,0.15)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              backgroundColor: "#2563eb",
              color: "#fff",
              padding: "20px",
              marginTop:"10px"
            }}
          >
            <h3
              style={{ margin: "0", fontSize: "24px", fontWeight: "700",marginTop:"20px" }}
            >
              🛒 Your Cart
            </h3>
          </div>

          <div style={{ flex: 1, padding: "20px" }}>
            <label style={{ display: "block", marginBottom: "16px" }}>
              <span
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                  
                }}
              >
                Select Table
              </span>
              <select
                style={{
                  width: "100%",
                  padding: "10px",
                  fontSize: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  outline: "none",
                }}
                value={selectedTable || ""}
                onChange={(e) => setSelectedTable(Number(e.target.value))}
              >
                <option value="">-- Choose a table --</option>
                {/* ✅ Only available tables shown */}
                {tables
                  .filter((t) => t.status === "available")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      Table {t.number} ({t.seats} seats)
                    </option>
                  ))}
              </select>
            </label>

            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h5
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {item.name}
                    </h5>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#2563eb",
                      }}
                    >
                      Rs {Number(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <button
                    onClick={() => changeQuantity(item.id, -1)}
                    style={{
                      backgroundColor: "#fff",
                      border: "2px solid #d1d5db",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      minWidth: "30px",
                      textAlign: "center",
                    }}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => changeQuantity(item.id, 1)}
                    style={{
                      backgroundColor: "#fff",
                      border: "2px solid #d1d5db",
                      borderRadius: "6px",
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              padding: "20px",
              backgroundColor: "#f9fafb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Total:
              </span>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: "700",
                  color: "#2563eb",
                }}
              >
                Rs {totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "700",
                opacity: loading ? 0.6 : 1,
              }}
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
