import React from "react";

const BookingDetailsPopup = ({ selectedBooking, setSelectedBooking, selectedRoom }) => {
    if (!selectedBooking) return null; // Non renderizza nulla se non è selezionata una prenotazione

    // 🔹 Funzione per formattare le date nel formato `dd/MM/yyyy`
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    // 🔹 Numero massimo di ospiti da mostrare
    const maxGuests = selectedRoom === "Cremera" ? 4 : 2;

    return (
        <div className="popup-overlay">
            <div className="popup popup-readonly">
                <h3>Dettagli prenotazione</h3>

                {/* 🔹 Mostra dinamicamente fino a `maxGuests` ospiti */}
                {selectedBooking.guests &&
                    selectedBooking.guests.slice(0, maxGuests).map((guest, index) => (
                        guest.firstName.trim() !== "" && guest.lastName.trim() !== "" && (
                            <div key={index} className="guest-container">
                                <h4>Ospite {index + 1}</h4>
                                <div className="name-fields">
                                    <input type="text" value={guest.firstName || ""} readOnly disabled />
                                    <input type="text" value={guest.lastName || ""} readOnly disabled />
                                </div>

                                <label>Data di nascita</label>
                                <input type="text" value={formatDate(guest.birthDate)} readOnly disabled />

                                <label>Esenzione</label>
                                <input type="text" value={guest.exemption} readOnly disabled />
                            </div>
                        )
                    ))
                }

                {/* 🔹 Dati generali della prenotazione */}
                <label>Data di inizio soggiorno</label>
                <input type="text" value={formatDate(selectedBooking.id)} readOnly disabled />

                <label>Data di fine soggiorno</label>
                <input type="text" value={formatDate(selectedBooking.stayEndDate)} readOnly disabled />

                <label>Tassa di soggiorno</label>
                <input type="text" value={(selectedBooking.touristTax || 0) + " €"} readOnly disabled />

                <label>Costo totale</label>
                <input type="text" value={selectedBooking.stayCost || ""} readOnly disabled />

                {selectedRoom === "Robinie" && (
                    <>
                        <label>Camera</label>
                        <input type="text" value={selectedBooking.roomType || ""} readOnly disabled />
                    </>
                )}

                <button onClick={() => setSelectedBooking(null)}>Chiudi</button>
            </div>
        </div>
    );
};

export default BookingDetailsPopup;
