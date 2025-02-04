const { db } = require("./firebase");

const saveBooking = async (room, subRoom, date, bookingData) => {
  try {
      // Estrarre anno e mese dalla data
      const [year, month] = date.split("-").map(Number);
      const monthString = `${year}-${String(month).padStart(2, "0")}`; // Esempio: "2025-01"

      // Verifica che il room e subRoom siano validi
      if (
          (room === "Robinie" && (subRoom === "Trevi" || subRoom === "S.Peter")) ||
          (room === "Cremera" && subRoom === "appartamento")
      ) {
          // 🔹 Percorso Firestore corretto: "prenotazioni/Robinie/S.Peter/2025-01"
          const bookingRef = db.collection("prenotazioni")
              .doc(room)                     // "Robinie" o "Cremera"
              .collection(subRoom)            // "Trevi", "S.Peter" o "appartamento"
              .doc(monthString)               // "2025-01"
              .collection("giorni")           // Sotto-collezione per evitare il problema dei documenti vuoti
              .doc(date);                     // "2025-01-01"

          // Controlla se esiste già una prenotazione
          const existingDoc = await bookingRef.get();
          if (existingDoc.exists) {
              return { success: false, message: "Una prenotazione esiste già per questa data." };
          }

          // Salva la prenotazione
          await bookingRef.set(bookingData);
          return { success: true, message: "Prenotazione salvata con successo" };
      } else {
          return { success: false, message: "Tipo di stanza non valido" };
      }
  } catch (error) {
      console.error("❌ Errore durante il salvataggio della prenotazione:", error);
      return { success: false, message: error.message };
  }
};



const getBookings = async (room, subRoom, selectedMonth) => {
  try {
      let bookings = [];
      let snapshots = [];

      // Creiamo il nome della collezione del mese, es. "2025-01"
      const currentYear = new Date().getFullYear();
      const monthString = `${currentYear}-${String(selectedMonth + 1).padStart(2, "0")}`;

      console.log(`📌 Recupero prenotazioni per il mese: ${monthString}`);

      if (room === "Robinie" && subRoom === "all") {
          // Se "all", dobbiamo prendere sia "Trevi" che "S.Peter"
          snapshots = await Promise.all([
              db.collection("prenotazioni").doc(room).collection("Trevi").doc(monthString).collection("giorni").get(),
              db.collection("prenotazioni").doc(room).collection("S.Peter").doc(monthString).collection("giorni").get()
          ]);
      } else if (room === "Cremera" && subRoom === "appartamento") {
          snapshots = [
              await db.collection("prenotazioni").doc(room).collection(subRoom).doc(monthString).collection("giorni").get()
          ];
      } else {
          snapshots = [
              await db.collection("prenotazioni").doc(room).collection(subRoom).doc(monthString).collection("giorni").get()
          ];
      }

      console.log(`📌 Trovate ${snapshots.length} collezioni di prenotazioni per ${monthString}`);

      snapshots.forEach(snapshot => {
          snapshot.forEach(doc => {
              const data = doc.data();
              bookings.push({ id: doc.id, ...data });
          });
      });

      console.log(`📌 Numero totale di prenotazioni recuperate: ${bookings.length}`);
      return { success: true, bookings };
  } catch (error) {
      console.error("❌ Errore durante il recupero delle prenotazioni:", error);
      return { success: false, bookings: [], message: error.message };
  }
};

const editBooking = async (room, subRoom, date, bookingData) => {
    try {
        // Estrarre anno e mese dalla data
        const [year, month] = date.split("-").map(Number);
        const monthString = `${year}-${String(month).padStart(2, "0")}`; // Esempio: "2025-01"

        // Verifica che room e subRoom siano validi
        if (
            (room === "Robinie" && (subRoom === "Trevi" || subRoom === "S.Peter")) ||
            (room === "Cremera" && subRoom === "appartamento")
        ) {
            // 🔹 Percorso Firestore corretto: "prenotazioni/Robinie/S.Peter/2025-01"
            const bookingRef = db.collection("prenotazioni")
                .doc(room)                     // "Robinie" o "Cremera"
                .collection(subRoom)            // "Trevi", "S.Peter" o "appartamento"
                .doc(monthString)               // "2025-01"
                .collection("giorni")           // Sotto-collezione per evitare problemi con documenti vuoti
                .doc(date);                     // "2025-01-01"

            // Controlla se la prenotazione esiste
            const existingDoc = await bookingRef.get();
            if (!existingDoc.exists) {
                return { success: false, message: "La prenotazione non esiste." };
            }

            // 🔹 Aggiorna la prenotazione
            await bookingRef.update(bookingData);
            console.log(`✅ Prenotazione modificata con successo: ${date}`);
            return { success: true, message: "Prenotazione modificata con successo" };
        } else {
            return { success: false, message: "Tipo di stanza non valido" };
        }
    } catch (error) {
        console.error("❌ Errore durante la modifica della prenotazione:", error);
        return { success: false, message: error.message };
    }
};



// Funzione per eliminare una prenotazione
const deleteBooking = async (room, subRoom, bookingId) => {
  try {
      // Estrai l'anno e il mese dalla `bookingId`
      const [year, month] = bookingId.split("-").map(Number);
      const monthString = `${year}-${String(month).padStart(2, "0")}`; // Esempio: "2025-01"

      // Verifica se il `room` e `subRoom` sono validi
      if (
          (room === "Robinie" && (subRoom === "Trevi" || subRoom === "S.Peter")) ||
          (room === "Cremera" && subRoom === "appartamento")
      ) {
          // 🔹 Percorso Firestore corretto
          const bookingRef = db.collection("prenotazioni")
              .doc(room)                     // "Robinie" o "Cremera"
              .collection(subRoom)            // "Trevi", "S.Peter" o "appartamento"
              .doc(monthString)               // "2025-01"
              .collection("giorni")           // Sotto-collezione con le prenotazioni per il mese
              .doc(bookingId);                // "2025-01-01"

          console.log(`📌 Eliminazione prenotazione da: prenotazioni/${room}/${subRoom}/${monthString}/giorni/${bookingId}`);

          // Controlla se la prenotazione esiste
          const existingDoc = await bookingRef.get();
          if (!existingDoc.exists) {
              console.error(`❌ Prenotazione non trovata a: prenotazioni/${room}/${subRoom}/${monthString}/giorni/${bookingId}`);
              return { success: false, message: "Prenotazione non trovata" };
          }

          // Elimina la prenotazione
          await bookingRef.delete();
          console.log(`✅ Prenotazione eliminata con successo: ${bookingId}`);

          return { success: true, message: "Prenotazione eliminata con successo" };
      } else {
          return { success: false, message: "Tipo di stanza non valido" };
      }
  } catch (error) {
      console.error("❌ Errore durante la cancellazione della prenotazione:", error);
      return { success: false, message: error.message };
  }
};


module.exports = { saveBooking, getBookings, deleteBooking, editBooking };
