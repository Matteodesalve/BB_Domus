import React, { useState, useEffect } from "react";
import RoomSelection from "./RoomSelection";
import MonthSelection from "./MonthSelection";
import BookingCalendar from "./BookingCalendar";
import BookingList from "./BookingList";
import BookingPopup from "./BookingPopup";
import BookingDetailsPopup from "./BookingDetailsPopup";
import "./SummarySection.css";

const SummarySection = () => {
    const [selectedRoom, setSelectedRoom] = useState("Robinie");
    const [selectedMonth, setSelectedMonth] = useState(0);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isFetching, setIsFetching] = useState(false);
    const [fetchTimestamp, setFetchTimestamp] = useState(0);

    const [calendarKey, setCalendarKey] = useState(0);

    useEffect(() => {
        // 🔄 Forza il ricaricamento del calendario ogni volta che le prenotazioni cambiano
        setCalendarKey((prevKey) => prevKey + 1);
    }, [bookings, selectedRoom, selectedMonth]);

    const fetchBookings = async (room, subRoom, month) => {
        try {
            if (isFetching) return;

            setIsFetching(true);
            setBookings([]);

            const timestamp = Date.now();
            setFetchTimestamp(timestamp);

            const response = await fetch(
                `http://localhost:5174/api/bookings/get?room=${room}&subRoom=${subRoom}&month=${month}`
            );

            if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);

            const data = await response.json();
            const formattedBookings = (data.bookings || []).map(booking => ({
                ...booking,
                stayEndDate: booking.stayEndDate ? new Date(booking.stayEndDate) : null,
                guests: booking.guests ? booking.guests.map(guest => ({
                    firstName: guest.firstName || "",
                    lastName: guest.lastName || "",
                    birthDate: guest.birthDate ? new Date(guest.birthDate) : null,
                })) : [{ firstName: "", lastName: "", birthDate: null }, { firstName: "", lastName: "", birthDate: null }],
            }));

            if (timestamp >= fetchTimestamp) {
                setBookings(formattedBookings);
            }
        } catch (error) {
            console.error("Errore nel recupero delle prenotazioni:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (!showPopup) {
            setSelectedDate(new Date(new Date().getFullYear(), selectedMonth, 1));
        }
    }, [selectedMonth, showPopup]);  // 🔹 Aggiorna la data quando chiudi il popup

    useEffect(() => {
        fetchBookings(selectedRoom, selectedRoom === "Robinie" ? "all" : "appartamento", selectedMonth);
    }, [selectedRoom, selectedMonth]);

    const handleRoomSelection = (room) => {
        setSelectedRoom(room);
        if (room === "Cremera") setSelectedMonth(0);
    };

    const handleMonthClick = (index) => {
        setSelectedMonth(index);
        setSelectedDate(new Date(new Date().getFullYear(), index, 1)); // 🔹 Imposta sempre il primo giorno del mese
    };

    const handleDayClick = (date) => {
        setSelectedDate(date);
        setShowPopup(true);
    };

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

                // 🔹 Rimuove subito la prenotazione eliminata per un aggiornamento istantaneo
                setBookings(prevBookings => prevBookings.filter(booking => booking.id !== bookingId));

                // 🔹 Attendi 500ms prima di ricaricare le prenotazioni per evitare dati vuoti
                setTimeout(() => {
                    fetchBookings(selectedRoom, selectedRoom === "Robinie" ? "all" : "appartamento", selectedMonth);
                }, 500);
            } else {
                alert("Errore nell'eliminazione: " + result.message);
            }
        } catch (error) {
            console.error("❌ Errore nella cancellazione:", error);
        }
    };

    return (
        <div className="summary-container">
            <h2>Seleziona la camera</h2>
            <RoomSelection selectedRoom={selectedRoom} onSelectRoom={handleRoomSelection} />

            <h2>Seleziona un mese</h2>
            <MonthSelection selectedMonth={selectedMonth} onSelectMonth={handleMonthClick} />

            <BookingCalendar
                selectedDate={selectedDate}
                onDayClick={handleDayClick}
                bookings={bookings} // 🔹 Passiamo le prenotazioni
                selectedMonth={selectedMonth}
                selectedRoom={selectedRoom}
            />

            <h2>Prenotazioni del mese</h2>
            <BookingList
                bookings={bookings}
                selectedRoom={selectedRoom}
                setSelectedBooking={setSelectedBooking}
                handleDeleteBooking={handleDeleteBooking}
            />

            {showPopup && (
                <BookingPopup
                    selectedDate={selectedDate}
                    setShowPopup={setShowPopup}
                    selectedRoom={selectedRoom}
                    setBookings={setBookings}
                    bookings={bookings}
                />
            )}

            <BookingDetailsPopup
                selectedBooking={selectedBooking}
                setSelectedBooking={setSelectedBooking}
                selectedRoom={selectedRoom}
            />
        </div>
    );
};

export default SummarySection;
