const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/booking");

const app = express();
const PORT = 5174;

// ✅ Configura correttamente CORS
const corsOptions = {
  origin: "http://localhost:5173", // Permetti richieste dal frontend
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Aggiungi un log per verificare le richieste
app.use((req, res, next) => {
  console.log(`🔹 [${req.method}] Richiesta ricevuta: ${req.url}`);
  next();
});

// ✅ Registra le route
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes); // ✅ Assicurati che sia "bookings" al plurale

// ✅ Avvia il server
app.listen(PORT, () => {
  console.log(`✅ Server in esecuzione su http://localhost:${PORT}`);
});
