import React, { useState, useEffect } from "react";
import { Route, useNavigate } from "react-router-dom";
import "./Homepage.css";
import summaryIcon from "../assets/summary_icon.png";
import cashIcon from "../assets/icon_cash.png";
import archiveIcon from "../assets/archivio_icon.png";

const HomePage = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  // Impedisce di tornare alla login con il pulsante indietro
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      navigate("/home"); // Impedisce di tornare indietro
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("authToken");
        sessionStorage.clear();
        alert("Logout effettuato con successo");
        navigate("/login", { replace: true });
      } else {
        alert("Errore durante il logout");
      }
    } catch (error) {
      console.error("Errore di connessione:", error);
      alert("Errore di connessione al server");
    }
  };

  const cards = [
    {
      id: 1,
      title: "Riepilogo",
      description: "Visualizza il riepilogo delle tue spese e utenze.",
      image: summaryIcon,
      route: "/summary",
    },
    {
      id: 2,
      title: "Utenze e Spese",
      description: "Gestisci le tue utenze e le spese mensili.",
      image: cashIcon,
    },
    {
      id: 3,
      title: "Archivio",
      description: "Consulta l'archivio delle transazioni passate.",
      image: archiveIcon,
    },
  ];

  return (
    <div className="home-container">
      <h1>Benvenuto nella Home!</h1>
      <div className="card-container">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${hoveredCard === card.id ? "active" : ""}`}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(card.route)}
          >
            <img src={card.image} alt={card.title} className="card-image" />
            <h3 className="card-title">{card.title}</h3>
            <p className="card-description">{card.description}</p>
          </div>
        ))}
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default HomePage;
