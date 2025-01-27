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

const getBookings = async (room, subRoom) => {
  try {
      let bookings = [];

      if (room === "Robinie" && subRoom === "all") {
          const treviSnapshot = await db.collection("prenotazioni").doc(room).collection("Trevi").get();
          const speterSnapshot = await db.collection("prenotazioni").doc(room).collection("S.Peter").get();
          console.log(treviSnapshot, speterSnapshot);

          treviSnapshot.forEach(doc => {
              bookings.push({ id: doc.id, ...doc.data(), roomType: "Trevi" });
          });

          speterSnapshot.forEach(doc => {
              bookings.push({ id: doc.id, ...doc.data(), roomType: "S.Peter" });
          });
      } else {
          const subRoomRef = db.collection("prenotazioni").doc(room).collection(subRoom);
          const snapshot = await subRoomRef.get();

          snapshot.forEach(doc => {
              bookings.push({ id: doc.id, ...doc.data() });
          });
      }

      if (bookings.length === 0) {
          return { success: false, message: "Nessuna prenotazione trovata" };
      }

      return { success: true, data: bookings };
  } catch (error) {
      console.error("Errore durante il recupero delle prenotazioni:", error);
      return { success: false, message: error.message };
  }
};


module.exports = { saveBooking, getBookings };
