import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
const [role, setRole] = useState("USER");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
     const res = await fetch(`\${process.env.REACT_APP_API_URL || "http://localhost:5001"}/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});

      const data = await res.json();

    if (res.ok) {
  localStorage.setItem("token", data.token);
  setIsLoggedIn(true);

  if (data.role === "ADMIN") {
    navigate("/admin1");
  } else {
    navigate("/");
  }


      } else {
        alert(data.message || "Invalid login");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to QuickPark</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
           

          <button type="submit" className="btn-primary">Login</button>
        </form>
        <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
      </div>
    </div>
  );
};

export default Login;
