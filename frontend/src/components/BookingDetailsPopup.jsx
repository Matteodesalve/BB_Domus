import React from "react";

const BookingDetailsPopup = ({ selectedBooking, setSelectedBooking, selectedRoom }) => {
    if (!selectedBooking) return null; // Non renderizza nulla se non è selezionata una prenotazione

    return (
        <div className="popup-overlay">
            <div className="popup popup-readonly">
                <h3>Dettagli prenotazione</h3>
                <div className="name-fields">
                    <input type="text" value={selectedBooking.firstName} readOnly disabled />
                    <input type="text" value={selectedBooking.lastName} readOnly disabled />
                </div>

                <label>Data di nascita</label>
                <input type="date" value={selectedBooking.birthDate} readOnly disabled />

                <label>Data di inizio soggiorno</label>
                <input type="text" value={selectedBooking.id} readOnly disabled />

                <label>Data di fine soggiorno</label>
                <input type="text" value={selectedBooking.stayEndDate} readOnly disabled />

                <label>Esenzione</label>
                <input type="text" value={selectedBooking.exemption} readOnly disabled />

                <label>Tassa di soggiorno</label>
                <input type="text" value={selectedBooking.touristTax + " €"} readOnly disabled />

                <label>Costo totale</label>
                <input type="text" value={selectedBooking.stayCost} readOnly disabled />

                {selectedRoom === "Robinie" && (
                    <>
                        <label>Camera</label>
                        <input type="text" value={selectedBooking.roomType} readOnly disabled />
                    </>
                )}

                <button onClick={() => setSelectedBooking(null)}>Chiudi</button>
            </div>
        </div>
    );
};

export default BookingDetailsPopup;
