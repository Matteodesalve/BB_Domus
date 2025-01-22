const express = require("express");
const { authenticateUser } = require("../services/authService");
const router = express.Router();

// Funzione di autenticazione da spostare nel frontend, non nel backend
const isAuthenticated = () => {
  return localStorage.getItem("authToken") !== null;
};

router.post("/login", async (req, res) => {
  console.log("Richiesta ricevuta per /login con:", req.body);
  const { username, password } = req.body;

  try {
    const result = await authenticateUser(username, password);
    res.status(200).json(result);
  } catch (error) {
    console.log("Errore durante il login:", error.message);
    res.status(401).json({ error: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("sessionToken"); // Cancella il cookie di sessione
  res.status(200).json({ message: "Logout effettuato con successo" });
});

module.exports = router;
