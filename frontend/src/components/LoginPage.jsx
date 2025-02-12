import React, { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import DomusLogo from "../assets/logo_domus.png";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("authToken", data.token); // Salva il token
        navigate("/home");
      } else {
        setError("Credenziali non valide");
      }
    } catch (error) {
      setError("Errore di connessione");
    }
  };  

  return (
    <div className="login-page">
      <div className="login-form-container">
        <form className="login-form" onSubmit={handleLogin}>
          <img src={DomusLogo} alt="" />
          <h2>ACCEDI</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
