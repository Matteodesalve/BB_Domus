const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 5174;

// Middleware
app.use(cors());
app.use(express.json());

// Rotte
app.use("/api/auth", authRoutes);

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});

const corsOptions = {
  origin: `http://localhost:${PORT}`,  // Assicurati che sia l'URL del tuo frontend
  credentials: true, // Necessario per inviare i cookie di sessione
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

