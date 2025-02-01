import React from "react";

const BookingDetailsPopup = ({ selectedBooking, setSelectedBooking, selectedRoom }) => {
    if (!selectedBooking) return null; // Non renderizza nulla se non è selezionata una prenotazione

    // 🔹 Funzione per formattare le date nel formato `dd/MM/yyyy`
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    return (
        <div className="popup-overlay">
            <div className="popup popup-readonly">
                <h3>Dettagli prenotazione</h3>

                {/* 🔹 Dati del primo ospite */}
                {selectedBooking.guests && selectedBooking.guests[0] && (
                    <>
                        <div className="guest-container">
                            <h4>Ospite 1</h4>
                            <div className="name-fields">
                                <input type="text" value={selectedBooking.guests[0].firstName || ""} readOnly disabled />
                                <input type="text" value={selectedBooking.guests[0].lastName || ""} readOnly disabled />
                            </div>

                            <label>Data di nascita</label>
                            <input type="text" value={formatDate(selectedBooking.guests[0].birthDate)} readOnly disabled />

                            <label>Esenzione</label>
                            <input type="text" value={selectedBooking.guests[0].exemption || "Nessuna"} readOnly disabled />
                        </div>
                    </>
                )}

                {/* 🔹 Dati del secondo ospite (se presente) */}
                {selectedBooking.guests && selectedBooking.guests[1] && selectedBooking.guests[1].firstName !== "" && (
                    <>
                        <div className="guest-container">
                            <h4>Ospite 2</h4>
                            <div className="name-fields">
                                <input type="text" value={selectedBooking.guests[1].firstName || ""} readOnly disabled />
                                <input type="text" value={selectedBooking.guests[1].lastName || ""} readOnly disabled />
                            </div>

                            <label>Data di nascita</label>
                            <input type="text" value={formatDate(selectedBooking.guests[1].birthDate)} readOnly disabled />

                            <label>Esenzione</label>
                            <input type="text" value={selectedBooking.guests[1].exemption || "Nessuna"} readOnly disabled />
                        </div>
                    </>
                )}

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
