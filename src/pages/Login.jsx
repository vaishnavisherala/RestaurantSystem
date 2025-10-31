import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const isEmail = identifier.includes("@");

      const response = await fetch("https://restaurantsystem-h1t0.onrender.com/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: password.trim(),
          ...(isEmail ? { email: identifier.trim() } : { username: identifier.trim() }),
        }),
      });

      // Check if network error
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Invalid credentials");
      }

      const data = await response.json();
      console.log("Backend response:", data);

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      alert("✅ Login successful!");
      navigate("/Home");
    } catch (err) {
      console.error("Login failed:", err);
      setError(`❌ ${err.message}`);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">🍽️ Login to Restaurant</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Username or Email</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>

        <p className="mt-3 text-center">
          Don’t have an account?{" "}
          <Link to="/SignUp" className="text-decoration-none">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
