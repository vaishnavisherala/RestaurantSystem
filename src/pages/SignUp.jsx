import React from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
const SignUp = () => {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault(); // prevent page reload

    try {
      const response = await fetch("https://restaurantsystem-4.onrender.com/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      console.log("Backend response:", data);
      alert("✅ Signup successful! Please login.");

      // Optional: store username/email for later login autofill
      localStorage.setItem(
        "user",
        JSON.stringify({ username: username, email: email })
      );

      // Clear form
      setUsername("");
      setEmail("");
      setPassword("");

      navigate("/");
    } catch (err) {
      console.error("Signup failed:", err);
      alert(`❌ ${err.message}`);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h3 className="text-center mb-3">🧾 Register Account</h3>

        <form onSubmit={handleSignUp}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Sign Up
          </button>
        </form>
 <p className="mt-3 text-center">
          Already have an account?{" "}
          <NavLink to="/" className="text-decoration-none">
            Login
          </NavLink>
        </p>      </div>
    </div>
  );
};

export default SignUp;
