import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingPopup = ({ selectedDate, setShowPopup, selectedRoom, setBookings, bookings }) => {
    const initialGuestData = {
        firstName: "",
        lastName: "",
        birthDate: null,
        exemption: "nessuna",
    };

    const [guests, setGuests] = useState([initialGuestData, initialGuestData]);
    const [currentGuestIndex, setCurrentGuestIndex] = useState(0);

    const initialBookingData = {
        stayEndDate: null,
        touristTax: 0,
        stayCost: "",
        bookingSource: "booking",
        roomType: selectedRoom === "Robinie" ? "" : "appartamento", // 🔹 Se Cremera, imposta direttamente il tipo stanza
    };

    const [bookingData, setBookingData] = useState(initialBookingData);
    const [isFormValid, setIsFormValid] = useState(false);
    const [disabledRooms, setDisabledRooms] = useState({ Trevi: false, SPeter: false });

    useEffect(() => {
        validateForm();
    }, [guests, bookingData]);

    useEffect(() => {
        if (selectedDate && bookings) {
            checkRoomAvailability();
        }
    }, [selectedDate, bookings]);

    const validateForm = () => {
        const isGuestValid = (guest) =>
            guest.firstName.trim() !== "" && guest.lastName.trim() !== "" && guest.birthDate;

        const atLeastOneGuestValid = guests.some(isGuestValid);
        const noPartialGuests = guests.every(
            (guest) =>
                (guest.firstName.trim() === "" && guest.lastName.trim() === "" && !guest.birthDate) ||
                isGuestValid(guest)
        );

        setIsFormValid(
            atLeastOneGuestValid &&
            noPartialGuests &&
            bookingData.stayEndDate &&
            (selectedRoom === "Robinie" ? bookingData.roomType !== "" : true) && // 🔹 Se Cremera, non richiede roomType
            /^\d*\.?\d{0,2} \u20AC$/.test(bookingData.stayCost.trim())
        );
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

            if (selectedDate >= checkInDate && selectedDate < checkOutDate) {
                if (booking.roomType === "Trevi") treviOccupied = true;
                if (booking.roomType === "S.Peter") speterOccupied = true;
            }
        });

        setDisabledRooms({ Trevi: treviOccupied, SPeter: speterOccupied });
    };

    const handleGuestInputChange = (e) => {
        const { name, value } = e.target;
        setGuests((prevGuests) => {
            const updatedGuests = [...prevGuests];
            updatedGuests[currentGuestIndex] = { ...updatedGuests[currentGuestIndex], [name]: value };
            return updatedGuests;
        });
    };

    const handleGuestDateChange = (date) => {
        setGuests((prevGuests) => {
            const updatedGuests = [...prevGuests];
            updatedGuests[currentGuestIndex] = { ...updatedGuests[currentGuestIndex], birthDate: date };
            return updatedGuests;
        });
    };

    const handleExemptionChange = (e) => {
        const { value } = e.target;
        setGuests((prevGuests) => {
            const updatedGuests = [...prevGuests];
            updatedGuests[currentGuestIndex] = { ...updatedGuests[currentGuestIndex], exemption: value };
            return updatedGuests;
        });
    };

    const handleGuestSwitch = (index) => {
        setCurrentGuestIndex(index);
    };

    const calculateTouristTax = () => {
        const calculateTaxForGuest = (guest) => {
            if (!guest.firstName || !guest.lastName || !guest.birthDate) return 0;

            const age = new Date().getFullYear() - new Date(guest.birthDate).getFullYear();
            const nights = bookingData.stayEndDate
                ? (new Date(bookingData.stayEndDate) - new Date(selectedDate)) / (1000 * 60 * 60 * 24)
                : 0;

            if (guest.exemption === "Residente" || guest.exemption === "Clinica Guarnieri" || guest.exemption === "Forze dell'Ordine" || age < 10 || age > 65) {
                return 0;
            }
            return nights > 0 ? nights * 6 : 0;
        };

        return calculateTaxForGuest(guests[0]) + calculateTaxForGuest(guests[1]);
    };

    const handleSaveBooking = async () => {
        const formatDateForDatabase = (date) => {
            if (!date) return null;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const dateKey = formatDateForDatabase(selectedDate);
        const room = selectedRoom;
        const subRoom = selectedRoom === "Robinie" ? bookingData.roomType : "appartamento";

        const bookingPayload = {
            ...bookingData,
            touristTax: calculateTouristTax(),
            birthDate: guests.map((g) => formatDateForDatabase(g.birthDate)),
            stayEndDate: formatDateForDatabase(bookingData.stayEndDate),
            guests,
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
                setBookings((prevBookings) => [...prevBookings, { id: dateKey, ...bookingPayload }]);
                setShowPopup(false);
            } else {
                alert("Errore nel salvataggio: " + result.message);
            }
        } catch (error) {
            console.error("Errore di connessione:", error);
            alert("Errore di connessione al server.");
        }
    };

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setGuests(prevGuests => {
            const updatedGuests = [...prevGuests];
            updatedGuests[currentGuestIndex] = { ...updatedGuests[currentGuestIndex], [name]: value };
            return updatedGuests;
        });
    };


    return (
        <div className="popup-overlay">
            <div className="popup">
                <h3>Prenotazione per il {selectedDate.toLocaleDateString()}</h3>

                <div className="name-fields">
                    <input type="text" name="firstName" placeholder="Nome" value={guests[currentGuestIndex].firstName} onChange={handleGuestInputChange} />
                    <input type="text" name="lastName" placeholder="Cognome" value={guests[currentGuestIndex].lastName} onChange={handleGuestInputChange} />
                </div>

                <label>Data di nascita</label>
                <DatePicker
                    selected={guests[currentGuestIndex].birthDate}
                    onChange={handleGuestDateChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleziona una data"
                    className="custom-datepicker"
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    minDate={new Date(1900, 0, 1)}
                    maxDate={new Date()}
                />

                <div className="guest-switch-container">
                    <button className={`guest-button ${currentGuestIndex === 0 ? "active" : ""}`} onClick={() => handleGuestSwitch(0)}>Ospite 1</button>

                    <button className={`guest-button ${currentGuestIndex === 1 ? "active" : ""}`} onClick={() => handleGuestSwitch(1)}>Ospite 2</button>

                </div>

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
                <DatePicker
                    selected={bookingData.stayEndDate}
                    onChange={(date) => setBookingData({ ...bookingData, stayEndDate: date })}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleziona una data"
                    className="custom-datepicker"
                />

                <label>Esenzione</label>
                <select value={guests[currentGuestIndex].exemption} onChange={handleExemptionChange}>
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
                <button onClick={handleClosePopup}>Chiudi</button>
            </div>
        </div>
    );
};

export default BookingPopup;
