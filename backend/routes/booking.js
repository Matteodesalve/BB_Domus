const express = require("express");
const { saveBooking, getBookings } = require("../services/bookingService");

const router = express.Router();

// Endpoint per salvare una prenotazione
router.post("/save", async (req, res) => {
  const { room, subRoom, date, bookingData } = req.body;
  console.log(req.body);

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
  const { room, subRoom } = req.query;

  if (!room || !subRoom) {
    return res.status(400).json({ success: false, message: "Parametri insufficienti" });
  }

  const result = await getBookings(room, subRoom);
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(404).json(result);
  }
});

module.exports = router;
