const { db } = require("./firebase");

// Funzione per salvare una prenotazione
const saveBooking = async (room, subRoom, date, bookingData) => {
  try {
    let subRoomPath;
    
    // Determina la sotto-collezione corretta in base alla camera selezionata
    if (room === "Robinie" && (subRoom === "Trevi" || subRoom === "S.Peter")) {
      subRoomPath = db.collection("prenotazioni").doc(room).collection(subRoom).doc(date);
    } else {
      subRoomPath = db.collection("prenotazioni").doc(room).collection("appartamento").doc(date);
    }

    // Controlla se esiste già una prenotazione per la data specificata
    const existingDoc = await subRoomPath.get();
    if (existingDoc.exists) {
      throw new Error("Una prenotazione esiste già per questa data.");
    }

    // Salva la prenotazione nella giusta collezione/sottocollezione
    await subRoomPath.set(bookingData);

    return { success: true, message: "Prenotazione salvata con successo" };
  } catch (error) {
    console.error("Errore durante il salvataggio della prenotazione:", error);
    return { success: false, message: error.message };
  }
};

// Funzione per ottenere le prenotazioni di una camera
const getBookings = async (room, subRoom) => {
  try {
    let subRoomRef;

    if (room === "Robinie" && (subRoom === "Trevi" || subRoom === "S.Peter")) {
      subRoomRef = db.collection("prenotazioni").doc(room).collection(subRoom);
    } else {
      subRoomRef = db.collection("prenotazioni").doc(room).collection("appartamento");
    }

    const bookingsSnapshot = await subRoomRef.get();

    if (bookingsSnapshot.empty) {
      return { success: false, message: "Nessuna prenotazione trovata" };
    }

    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, data: bookings };
  } catch (error) {
    console.error("Errore durante il recupero delle prenotazioni:", error);
    return { success: false, message: error.message };
  }
};

module.exports = { saveBooking, getBookings };
