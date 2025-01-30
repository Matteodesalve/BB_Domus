import React, { useState, useEffect } from "react";

const BookingPopup = ({ selectedDate, setShowPopup, selectedRoom, setBookings, bookings }) => {
    const initialBookingData = {
        firstName: "",
        lastName: "",
        birthDate: "",
        stayEndDate: "",
        exemption: "nessuna",
        touristTax: 0,
        stayCost: "",
        bookingSource: "booking",
        roomType: "",
    };

    const [bookingData, setBookingData] = useState(initialBookingData);
    const [isFormValid, setIsFormValid] = useState(false);
    const [disabledRooms, setDisabledRooms] = useState({ Trevi: false, SPeter: false });

    useEffect(() => {
        validateForm();
    }, [bookingData]);

    useEffect(() => {
        if (selectedDate && bookings) {
            checkRoomAvailability();
        }
    }, [selectedDate, bookings]);


    const validateForm = () => {
        const { firstName, lastName, birthDate, stayEndDate, stayCost, roomType } = bookingData;
        setIsFormValid(
            firstName.trim() !== "" &&
            lastName.trim() !== "" &&
            birthDate &&
            stayEndDate &&
            roomType !== "" &&
            /^\d*\.?\d{0,2} €$/.test(stayCost.trim())
        );
    };

    const calculateTouristTax = () => {
        const { exemption, birthDate, stayEndDate } = bookingData;
        const age = birthDate ? new Date().getFullYear() - new Date(birthDate).getFullYear() : null;
        const nights = stayEndDate ? (new Date(stayEndDate) - new Date(selectedDate)) / (1000 * 60 * 60 * 24) : 0;

        if (exemption === "Residente" || exemption === "Clinica Guarnieri" || exemption === "Forze dell'Ordine" || (age !== null && (age < 10 || age > 65))) {
            return 0;
        }
        if (nights === 0) return 0;
        return (nights * 6) - 0.25;
    };

    const checkRoomAvailability = () => {
        if (selectedRoom !== "Robinie") return;

        let treviOccupied = false;
        let speterOccupied = false;

        bookings.forEach((booking) => {
            const checkInDate = new Date(booking.id);
            const checkOutDate = new Date(booking.stayEndDate);
            checkOutDate.setDate(checkOutDate.getDate() - 1);
            checkInDate.setDate(checkInDate.getDate() - 1);

            // Se il giorno selezionato è all'interno di una prenotazione esistente
            if (selectedDate >= checkInDate && selectedDate < checkOutDate) {
                if (booking.roomType === "Trevi") treviOccupied = true;
                if (booking.roomType === "S.Peter") speterOccupied = true;
            }
        });

        setDisabledRooms({ Trevi: treviOccupied, SPeter: speterOccupied });

        // Debug: controlla se i bottoni vengono disabilitati correttamente
        console.log("🔹 Stato disabledRooms aggiornato:", { Trevi: treviOccupied, SPeter: speterOccupied });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData({ ...bookingData, [name]: value });
    };

    const handleSaveBooking = async () => {
        const dateKey = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];

        const room = selectedRoom;
        const subRoom = room === "Robinie" ? bookingData.roomType : "appartamento";

        const bookingPayload = {
            ...bookingData,
            touristTax: calculateTouristTax(),
        };

        try {
            const response = await fetch("/api/bookings/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room, subRoom, date: dateKey, bookingData: bookingPayload }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Prenotazione salvata con successo!");
                setBookings(prevBookings => [...prevBookings, { id: dateKey, ...bookingPayload }]);
                setShowPopup(false);
            } else {
                alert("Errore nel salvataggio: " + result.message);
            }
        } catch (error) {
            console.error("Errore di connessione:", error);
            alert("Errore di connessione al server.");
        }
    };

    return (
        <div className="popup-overlay">
            <div className="popup">
                <h3>Prenotazione per il {selectedDate.toLocaleDateString()}</h3>
                <div className="name-fields">
                    <input type="text" name="firstName" placeholder="Nome" value={bookingData.firstName} onChange={handleInputChange} />
                    <input type="text" name="lastName" placeholder="Cognome" value={bookingData.lastName} onChange={handleInputChange} />
                </div>

                <label>Data di nascita</label>
                <input type="date" name="birthDate" value={bookingData.birthDate} onChange={handleInputChange} />

                {selectedRoom === "Robinie" && (
                    <div className="room-selection">
                        <label>Seleziona camera</label>
                        <div className="button-group">
                            <button
                                className={`room-button ${bookingData.roomType === "Trevi" ? "selected-trevi" : ""} ${disabledRooms.Trevi ? "disabled" : ""}`}
                                onClick={() => setBookingData({ ...bookingData, roomType: "Trevi" })}
                                disabled={disabledRooms.Trevi} // 🔹 Disabilita il bottone se necessario
                            >
                                Trevi
                            </button>
                            <button
                                className={`room-button ${bookingData.roomType === "S.Peter" ? "selected-speter" : ""} ${disabledRooms.SPeter ? "disabled" : ""}`}
                                onClick={() => setBookingData({ ...bookingData, roomType: "S.Peter" })}
                                disabled={disabledRooms.SPeter} // 🔹 Disabilita il bottone se necessario
                            >
                                S.Peter
                            </button>
                        </div>
                    </div>
                )}

                <label>Data di fine soggiorno</label>
                <input type="date" name="stayEndDate" value={bookingData.stayEndDate} onChange={handleInputChange} />

                <label>Esenzione</label>
                <select name="exemption" value={bookingData.exemption} onChange={handleInputChange}>
                    <option value="nessuna">Nessuna esenzione</option>
                    <option value="Residente">Residente</option>
                    <option value="Clinica Guarnieri">Clinica Guarnieri</option>
                    <option value="Forze dell'Ordine">Forze dell'Ordine</option>
                </select>

                <label>Tassa di soggiorno</label>
                <input type="text" className="cost-input" value={calculateTouristTax() + " €"} readOnly disabled />

                <label>Costo totale</label>
                <input
                    type="text"
                    className="cost-input"
                    name="stayCost"
                    placeholder="0 €"
                    value={bookingData.stayCost}
                    onChange={(e) => {
                        let value = e.target.value.replace(/[^\d.,]/g, '').replace(/,/g, '.');
                        if (/^\d*\.?\d{0,2}$/.test(value)) {
                            setBookingData({ ...bookingData, stayCost: value + ' €' });
                        }
                    }}
                />

                <label>Fonte Prenotazione</label>
                <select name="bookingSource" value={bookingData.bookingSource} onChange={handleInputChange}>
                    <option value="booking">Booking.com</option>
                    <option value="airbnb">Airbnb</option>
                    <option value="sito_web">Sito Web</option>
                </select>

                <button onClick={handleSaveBooking} disabled={!isFormValid} className={`save-button ${!isFormValid ? 'disabled' : ''}`}>Salva Prenotazione</button>
                <button onClick={() => setShowPopup(false)}>Chiudi</button>
            </div>
        </div>
    );
};

export default BookingPopup;
