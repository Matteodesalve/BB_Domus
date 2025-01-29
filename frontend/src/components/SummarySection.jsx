import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./SummarySection.css";

const SummarySection = () => {
    const [selectedRoom, setSelectedRoom] = useState("Robinie");
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDates, setSelectedDates] = useState(new Set());


    const initialBookingData = {
        firstName: "",
        lastName: "",
        birthDate: "",
        stayEndDate: "",
        exemption: "nessuna",
        touristTax: 0,
        stayCost: "",
        bookingSource: "booking",
        roomType: "", // Nessuna selezione iniziale
    };
    


    const [bookingData, setBookingData] = useState(initialBookingData);
    const [isFormValid, setIsFormValid] = useState(false);

    const rooms = ["Robinie", "Cremera"];
    const months = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];

    useEffect(() => {
        validateForm();
    }, [bookingData]);

    const validateForm = () => {
        const { firstName, lastName, birthDate, stayEndDate, stayCost } = bookingData;

        if (
            firstName.trim() !== "" &&
            lastName.trim() !== "" &&
            birthDate &&
            stayEndDate &&
            /^\d*\.?\d{0,2} €$/.test(stayCost.trim())
        ) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    };

    const handleRoomSelection = (room) => {
        setSelectedRoom(room);
        setSelectedMonth(0);
    };

    const handleMonthClick = (index) => {
        setSelectedMonth(index);
        const currentYear = new Date().getFullYear();
        setSelectedDate(new Date(currentYear, index, 1));
    };

    const handleDayClick = (date) => {
        setSelectedDate(date);
        setSelectedDates((prevDates) => new Set(prevDates.add(date.toDateString()))); // Memorizza la data
        handlePopupOpen();
    };
    

    const handlePopupOpen = () => {
        setShowPopup(true);
        document.body.classList.add("no-scroll"); // Disabilita lo scroll della pagina
    };

    const handlePopupClose = () => {
        setBookingData(initialBookingData);
        setShowPopup(false);
        document.body.classList.remove("no-scroll");
    
        // Rimuove la selezione dal calendario
        setSelectedDates((prevDates) => {
            const newDates = new Set(prevDates);
            newDates.delete(selectedDate.toDateString());
            return newDates;
        });
    
        setSelectedDate(null); // Resetta la data selezionata
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData({
            ...bookingData,
            [name]: value,
        });
    };

    const handleSaveBooking = async () => {
        const dateKey = selectedDate.toISOString().split('T')[0]; // Formatta la data YYYY-MM-DD
        const room = selectedRoom; // "Robinie" o "Cremera"
        const subRoom = room === "Robinie" ? bookingData.roomType : "appartamento";  // Selezione corretta della sotto-camera
        
        const bookingPayload = {
            firstName: bookingData.firstName,
            lastName: bookingData.lastName,
            birthDate: bookingData.birthDate,
            stayEndDate: bookingData.stayEndDate,
            exemption: bookingData.exemption,
            touristTax: calculateTouristTax(),
            stayCost: bookingData.stayCost,
            bookingSource: bookingData.bookingSource,
        };
    
        try {
            console.log(bookingData)
            const response = await fetch("/api/booking/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room, subRoom, date: dateKey, bookingData: bookingPayload }),
            });
    
            const result = await response.json();
            if (result.success) {
                alert("Prenotazione salvata con successo!");
                handlePopupClose();
            } else {
                alert("Errore nel salvataggio: " + result.message);
            }
        } catch (error) {
            console.error("Errore di connessione:", error);
            alert("Errore di connessione al server.");
        }
    };
    
    
    return (
        <div className="summary-container">
            <h2>Seleziona la camera</h2>
            <div className="room-buttons">
                {rooms.map((room) => (
                    <button
                        key={room}
                        className={selectedRoom === room ? "active" : ""}
                        onClick={() => handleRoomSelection(room)}
                    >
                        {room}
                    </button>
                ))}
            </div>

            <h2>Seleziona un mese</h2>
            <div className="month-buttons">
                {months.map((month, index) => (
                    <button
                        key={month}
                        className={selectedMonth === index ? "active" : ""}
                        onClick={() => handleMonthClick(index)}
                    >
                        {month}
                    </button>
                ))}
            </div>

            {selectedMonth !== null && (
                <div className="calendar-container">
                    <Calendar
                        onChange={handleDayClick}
                        value={selectedDate}
                        activeStartDate={selectedDate}
                        tileClassName={({ date, view }) => {
                            const today = new Date();
                            const isToday = date.toDateString() === today.toDateString();
                    
                            if (view === "month") {
                                return isToday ? "current-day" : "reset-cell"; // Resetta tutte le celle tranne il giorno corrente
                            }
                    
                            return "";
                        }}
                    />
                </div>
            )}

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup">
                        <h3>Prenotazione per il {selectedDate.toLocaleDateString()}</h3>
                        <div className="name-fields">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="Nome"
                                value={bookingData.firstName}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Cognome"
                                value={bookingData.lastName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <label>Data di nascita</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={bookingData.birthDate}
                            onChange={handleInputChange}
                        />
                        {selectedRoom === "Robinie" && (
                            <div className="room-selection">
                                <label>Seleziona camera</label>
                                <div className="button-group">
                                    <button
                                        className={`room-button ${bookingData.roomType === "Trevi" ? "selected-trevi" : ""}`}
                                        onClick={() => setBookingData({ ...bookingData, roomType: "Trevi" })}
                                    >
                                        Trevi
                                    </button>
                                    <button
                                        className={`room-button ${bookingData.roomType === "S.Peter" ? "selected-speter" : ""}`}
                                        onClick={() => setBookingData({ ...bookingData, roomType: "S.Peter" })}
                                    >
                                        S.Peter
                                    </button>
                                </div>
                            </div>
                        )}

                        <label>Data di fine soggiorno</label>
                        <input
                            type="date"
                            name="stayEndDate"
                            value={bookingData.stayEndDate}
                            onChange={handleInputChange}
                        />
                        <select
                            name="exemption"
                            value={bookingData.exemption}
                            onChange={handleInputChange}
                        >
                            <option value="nessuna">Nessuna esenzione</option>
                            <option value="Residente">Residente</option>
                            <option value="Clinica Guarnieri">Clinica Guarnieri</option>
                            <option value="Forze dell'Ordine">Forze dell'Ordine</option>
                        </select>
                        <input
                            type="text"
                            className="cost-input"
                            name="touristTax"
                            value={calculateTouristTax() + " €"}
                            readOnly
                            disabled
                        />
                        <div className="cost-container">
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
                        </div>
                        <select
                            name="bookingSource"
                            value={bookingData.bookingSource}
                            onChange={handleInputChange}
                        >
                            <option value="booking">Booking.com</option>
                            <option value="airbnb">Airbnb</option>
                            <option value="sito_web">Sito Web</option>
                        </select>
                        <button
                            onClick={handleSaveBooking}
                            disabled={!isFormValid}
                            className={`save-button ${!isFormValid ? 'disabled' : ''}`}
                        >
                            Salva Prenotazione
                        </button>
                        <button onClick={handlePopupClose}>Chiudi</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SummarySection;
