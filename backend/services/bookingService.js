const { db } = require("./firebase");

// Funzione per salvare una prenotazione
const saveBooking = async (room, subRoom, date, bookingData) => {
  try {
    let subRoomPath;
    
    // Determina la sotto-collezione corretta
    if (room === "Robinie" && (subRoom === "Trevi" || subRoom === "S.Peter")) {
      subRoomPath = db.collection("prenotazioni").doc(room).collection(subRoom).doc(date);
    } 
    else if(room === "Cremera" && subRoom === "appartamento") {
      subRoomPath = db.collection("prenotazioni").doc(room).collection(subRoom).doc(date);
    }
    else {
      return { success: false, message: "Tipo di stanza non valido" };
    }
    // Controlla se esiste già una prenotazione
    const existingDoc = await subRoomPath.get();
    if (existingDoc.exists) {
      return { success: false, message: "Una prenotazione esiste già per questa data." };
    }

    // Salva la prenotazione
    await subRoomPath.set(bookingData);
    return { success: true, message: "Prenotazione salvata con successo" };
  } catch (error) {
    console.error("❌ Errore durante il salvataggio della prenotazione:", error);
    return { success: false, message: error.message };
  }
};

// Funzione per ottenere le prenotazioni
const getBookings = async (room, subRoom) => {
  try {
    let bookings = [];

    if (room === "Robinie" && subRoom === "all") {
      // Recupera le prenotazioni sia per Trevi che per S.Peter
      const [treviSnapshot, speterSnapshot] = await Promise.all([
        db.collection("prenotazioni").doc(room).collection("Trevi").get(),
        db.collection("prenotazioni").doc(room).collection("S.Peter").get()
      ]);

      treviSnapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data(), roomType: "Trevi" });
      });

      speterSnapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data(), roomType: "S.Peter" });
      });
    } 
    else if (room === "Cremera" && subRoom === "appartamento") {
      // Recupera le prenotazioni per Cremera -> appartamento
      const snapshot = await db.collection("prenotazioni").doc(room).collection(subRoom).get();

      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
    } 
    else {
      const subRoomRef = db.collection("prenotazioni").doc(room).collection(subRoom);
      const snapshot = await subRoomRef.get();

      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
    }

    return { success: true, bookings };
  } catch (error) {
    console.error("❌ Errore durante il recupero delle prenotazioni:", error);
    return { success: false, bookings: [], message: error.message };
  }
};

module.exports = { saveBooking, getBookings };
