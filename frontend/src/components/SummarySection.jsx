import React, { useState, useEffect } from "react";
import check_in_icon from "../assets/check_in_icon.png";
import check_out_icon from "../assets/check_out_icon.png";
import money_icon from "../assets/money_icon.png";
import person_icon from "../assets/person_icon.png";
import tax_icon from "../assets/tax_icon.png";
import room_icon from "../assets/room_icon.png";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./SummarySection.css";

const SummarySection = () => {
    const [selectedRoom, setSelectedRoom] = useState("Robinie");
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [bookings, setBookings] = useState([]); // Stato per le prenotazioni
    const [selectedDates, setSelectedDates] = useState(new Set());
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(false);
    let fetchTimeout = null; // Variabile per il debounce
    const [isFetching, setIsFetching] = useState(false);
    const [fetchTimestamp, setFetchTimestamp] = useState(0);


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

    const fetchBookings = async (room, subRoom, month) => {
        try {
            if (isFetching) {
                console.log("⏳ Una richiesta è già in corso, evitando chiamata duplicata...");
                return;
            }

            setIsFetching(true); // Imposta lo stato di caricamento
            setBookings([]); // Svuota la lista per evitare dati vecchi

            const timestamp = Date.now();
            setFetchTimestamp(timestamp);

            console.log("🔹 Richiesta GET per", { room, month });

            const response = await fetch(
                `http://localhost:5174/api/bookings/get?room=${room}&subRoom=${subRoom}&month=${month}`
            );

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Errore HTTP: ${response.status} - ${errorMessage}`);
            }

            const data = await response.json();

            // Controlla se il timestamp attuale è ancora il più recente
            if (timestamp >= fetchTimestamp) {
                console.log("📌 Prenotazioni ricevute:", data);
                setBookings(data.bookings || []);
            } else {
                console.log("❌ Ignorata risposta vecchia (richiesta sovrascritta)");
            }
        } catch (error) {
            console.error("❌ Errore nel recupero delle prenotazioni:", error);
        } finally {
            setIsFetching(false);
        }
    };


    useEffect(() => {
        // Creiamo una funzione asincrona per garantire che lo stato sia aggiornato
        const fetchData = async () => {
            await fetchBookings(selectedRoom, selectedRoom === "Robinie" ? "all" : "appartamento", selectedMonth);
        };

        fetchData();
    }, [selectedRoom, selectedMonth]);




    const handleDeleteBooking = async (bookingId, room, subRoom) => {
        try {
            console.log("🔹 Invio DELETE per", { bookingId, room, subRoom });

            const response = await fetch(`http://localhost:5174/api/bookings/delete?room=${room}&subRoom=${subRoom}&bookingId=${bookingId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Errore HTTP: ${response.status} - ${errorMessage}`);
            }

            const result = await response.json();
            console.log("✅ Risposta DELETE:", result);

            if (result.success) {
                alert("Prenotazione eliminata con successo!");
                fetchBookings();
            } else {
                alert("Errore nell'eliminazione: " + result.message);
            }
        } catch (error) {
            console.error("❌ Errore nella cancellazione:", error);
        }
    };




    const handleShowDetails = (booking) => {
        setSelectedBooking(booking);
    };


    const handleRoomSelection = (room) => {
        setSelectedRoom(room);
        if (room == "Cremera") {
            setSelectedMonth(0);
        }
    };

    const handleMonthClick = (index) => {
        const currentYear = new Date().getFullYear();
        const newDate = new Date(currentYear, index, 1); // Primo giorno del mese selezionato

        setSelectedMonth(index);
        setSelectedDate(newDate);  // ✅ Aggiorna la data del calendario
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
        const dateKey = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
            .toISOString()
            .split('T')[0];
        const room = selectedRoom; // "Robinie" o "Cremera"
        const subRoom = room === "Robinie" ? bookingData.roomType : "appartamento";

        const bookingPayload = {
            firstName: bookingData.firstName,
            lastName: bookingData.lastName,
            birthDate: bookingData.birthDate,
            stayEndDate: bookingData.stayEndDate,
            exemption: bookingData.exemption,
            touristTax: calculateTouristTax(),
            stayCost: bookingData.stayCost,
            roomType: bookingData.roomType,
            bookingSource: bookingData.bookingSource,
        };

        try {
            console.log(bookingData)
            const response = await fetch("/api/bookings/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room, subRoom, date: dateKey, bookingData: bookingPayload }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Prenotazione salvata con successo!");

                // ✅ AGGIUNGI LA NUOVA PRENOTAZIONE ALLA LISTA, SENZA CHIAMARE IL SERVER DI NUOVO
                setBookings(prevBookings => [
                    ...prevBookings,
                    { id: dateKey, ...bookingPayload }
                ]);

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
                        activeStartDate={selectedDate}  // ✅ Si aggiorna quando cambia il mese
                        tileClassName={({ date, view }) => {
                            const today = new Date();
                            const isToday = date.toDateString() === today.toDateString();

                            if (view === "month") {
                                return isToday ? "current-day" : "reset-cell";
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
            {/* Nuova sezione: Prenotazioni del mese */}
            <h2>Prenotazioni del mese</h2>
            {isFetching ? (
                <div className="loading-container">
                    <p>Caricamento prenotazioni...</p>
                </div>
            ) : (
                <div className="booking-container">
                    {bookings.length === 0 ? (
                        <p className="no-bookings">Nessuna prenotazione per questo mese.</p>
                    ) : (
                        <div className="booking-list">
                            {bookings.map((booking) => {
                                const formatDate = (dateString) => {
                                    const date = new Date(dateString);
                                    return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
                                };

                                return (
                                    <div key={booking.id} className="booking-row" onClick={() => handleShowDetails(booking)}>
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
                                            1
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
                                                    event.stopPropagation(); // 🔹 Blocca la propagazione del click alla riga
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
            )}



            {selectedBooking && (
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
            )}
        </div>
    );
};

export default SummarySection;
