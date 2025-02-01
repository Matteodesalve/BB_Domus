import React from "react";
import check_in_icon from "../assets/check_in_icon.png";
import check_out_icon from "../assets/check_out_icon.png";
import money_icon from "../assets/money_icon.png";
import person_icon from "../assets/person_icon.png";
import tax_icon from "../assets/tax_icon.png";
import room_icon from "../assets/room_icon.png";

const BookingList = ({ bookings, selectedRoom, setSelectedBooking, handleDeleteBooking }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
    };

    return (
        <div className="booking-container">
            {bookings.length === 0 ? (
                <p className="no-bookings">Nessuna prenotazione per questo mese.</p>
            ) : (
                <div className="booking-list">
                    {bookings.map((booking) => {
                        // 🔹 Verifica il numero di ospiti basandosi sui campi firstName
                        const numberOfGuests = booking.guests && 
                            booking.guests.length === 2 &&
                            booking.guests[0].firstName.trim() !== "" &&
                            booking.guests[1].firstName.trim() !== "" ? 2 : 1;

                        return (
                            <div key={booking.id} className="booking-row" onClick={() => setSelectedBooking(booking)}>
                                <span className="booking-field">
                                    <img src={check_in_icon} alt="Data" className="icon" />
                                    {formatDate(booking.id)}
                                </span>
                                <span className="booking-field">
                                    <img src={check_out_icon} alt="Fine soggiorno" className="icon" />
                                    {formatDate(booking.stayEndDate)}
                                </span>
                                <span className="booking-field">
                                    <img src={person_icon} alt="Persone" className="icon" />
                                    {numberOfGuests}
                                </span>
                                <span className="booking-field">
                                    <img src={tax_icon} alt="Tassa soggiorno" className="icon" />
                                    {booking.touristTax + " €"}
                                </span>
                                <span className="booking-field">
                                    <img src={money_icon} alt="Costo totale" className="icon" />
                                    {booking.stayCost}
                                </span>
                                {selectedRoom === "Robinie" && (
                                    <span className="booking-field">
                                        <img src={room_icon} alt="Camera" className="icon" />
                                        {booking.roomType}
                                    </span>
                                )}
                                <div className="booking-actions">
                                    <button className="edit-button">Modifica</button>
                                    <button
                                        className="delete-button"
                                        onClick={(event) => {
                                            event.stopPropagation(); // 🔹 Evita che il click si propaghi alla riga intera
                                            handleDeleteBooking(booking.id, selectedRoom, selectedRoom === "Robinie" ? booking.roomType : "appartamento");
                                        }}
                                    >
                                        Cancella
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookingList;
