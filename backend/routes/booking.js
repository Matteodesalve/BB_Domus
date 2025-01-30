const express = require("express");
const { saveBooking, getBookings, deleteBooking } = require("../services/bookingService");

const router = express.Router();

// Endpoint per salvare una prenotazione
router.post("/save", async (req, res) => {
  const { room, subRoom, date, bookingData } = req.body;
  console.log("📌 Dati ricevuti per il salvataggio:", req.body);

  if (!room || !subRoom || !date || !bookingData) {
    return res.status(400).json({ success: false, message: "Dati insufficienti" });
  }

  const result = await saveBooking(room, subRoom, date, bookingData);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Endpoint per ottenere le prenotazioni
router.get("/get", async (req, res) => {
  const { room, subRoom, month } = req.query;

  if (!room || !subRoom || month === undefined) {
      return res.status(400).json({ success: false, message: "Dati mancanti" });
  }

  try {
      const selectedMonth = parseInt(month, 10);
      const result = await getBookings(room, subRoom, selectedMonth);
      res.json(result);
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});


console.log("🔹 Registrazione route: DELETE /api/bookings/delete");

router.delete("/delete", async (req, res) => {
    console.log("🔹 DELETE ricevuto con questi parametri:", req.query);

    const { room, subRoom, bookingId } = req.query; // 👈 Usa req.query, non req.body

    if (!room || !subRoom || !bookingId) {
        console.log("❌ Parametri mancanti!");
        return res.status(400).json({ success: false, message: "Dati insufficienti per la cancellazione" });
    }

    try {
        const result = await deleteBooking(room, subRoom, bookingId);
        console.log("🔹 Risultato eliminazione:", result);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.error("❌ Errore nella cancellazione della prenotazione:", error);
        return res.status(500).json({ success: false, message: "Errore del server" });
    }
});



module.exports = router;
