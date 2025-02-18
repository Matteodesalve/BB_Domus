import React, { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import DomusLogo from "../assets/logo_domus.png";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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
        localStorage.setItem("authToken", data.token);
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
          <img src={DomusLogo} alt="Domus Logo" />
          <h2>ACCEDI</h2>

          {/* Campo Username */}
          <div className="input-container">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setIsUsernameFocused(true)}
              onBlur={() => setIsUsernameFocused(username.length > 0)}
              placeholder={isUsernameFocused ? "" : "es. mario.rossi"}
            />
          </div>

          {/* Campo Password */}
          <div className="input-container">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(password.length > 0)}
              placeholder={isPasswordFocused ? "" : "••••••••"}
            />
          </div>

          <button type="submit">Login</button>
          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
