import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import corretto
import { MdHome } from "react-icons/md"; // 🔹 Import icona moderna
import RoomSelection from "./RoomSelection";
import MonthSelection from "./MonthSelection";
import BookingCalendar from "./BookingCalendar";
import BookingList from "./BookingList";
import BookingPopup from "./BookingPopup";
import BookingDetailsPopup from "./BookingDetailsPopup";
import MonthlySummary from "./MonthlySummary";
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

    const navigate = useNavigate();

    const [monthlySummary, setMonthlySummary] = useState({
        totalTax: 0,
        totalCost: 0,
        numPerson: 0,
        numNight: 0,
        numEs: 0,
        numAir: 0,
    });

    const [editingBooking, setEditingBooking] = useState(null);

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
                    exemption: guest.exemption || "Nessuna",
                })) : [{ firstName: "", lastName: "", birthDate: null , exemption: "nessuna"}, { firstName: "", lastName: "", birthDate: null, exemption: "nessuna" }],
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
        const calculateSummary = () => {
            let totalTax = 0;
            let totalCost = 0;
            let numPerson = 0;
            let numAir = 0;
            let numEs = 0;
            let numNight = 0;

            bookings.forEach(booking => {
                totalTax += booking.touristTax || 0;
                const costValue = parseFloat(booking.stayCost.replace(/\D/g, ""));
                totalCost += isNaN(costValue) ? 0 : costValue;

                let bookingPersons = 0;

                booking.guests = Array.isArray(booking.guests) ? booking.guests : [];

                console.log("Booking Guests (tipo):", typeof booking.guests);
                console.log("Booking Guests (contenuto):", booking.guests);

                booking.guests.forEach(guest => {
                    console.log("Guest:", guest); // 🔹 Verifica il contenuto di ogni guest
                    if (guest.firstName && guest.firstName.trim() !== "") {
                        bookingPersons++;
                        console.log("Persona aggiunta:", bookingPersons);
                        console.log("Esenzione persona:", guest.exemption);

                        if (guest.exemption && guest.exemption.trim().toLowerCase() !== "nessuna") {
                            numEs++;
                            console.log("Esenzione aggiunta, totale:", numEs);
                        }
                    }
                });

                numPerson += bookingPersons;

                if (booking.id && booking.stayEndDate) {
                    const startDate = new Date(booking.id); // Supponiamo che l'id sia un valore interpretabile come data
                    const endDate = new Date(booking.stayEndDate);
                    const nights = Math.max((endDate - startDate) / (1000 * 60 * 60 * 24), 0); // Sottrae 1 giorno
                    console.log("Notti:", nights);
                    numNight += nights * bookingPersons;
                }

                if (booking.bookingSource && booking.bookingSource.toLowerCase() === "airbnb") {
                    numAir++;
                }

            });

            setMonthlySummary({
                totalTax,
                totalCost,
                numPerson,
                numNight,
                numEs,
                numAir,
            });
        };

        calculateSummary();
    }, [bookings]);

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
            {/* 🔹 Bottone Home in alto a sinistra */}
            <button className="home-button" onClick={() => navigate("/")}>
                <MdHome size={28} />
            </button>
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

            <BookingList
                bookings={bookings}
                selectedRoom={selectedRoom}
                setSelectedBooking={setSelectedBooking}
                handleDeleteBooking={handleDeleteBooking}
                setEditingBooking={setEditingBooking} // 🔹 Passa lo stato
                setShowPopup={setShowPopup} // 🔹 Per aprire il popup
            />

            {showPopup && (
                <BookingPopup
                    selectedDate={selectedDate}
                    setShowPopup={setShowPopup}
                    selectedRoom={selectedRoom}
                    setBookings={setBookings}
                    bookings={bookings}
                    fetchBookings={fetchBookings}
                    selectedMonth={selectedMonth}
                    editingBooking={editingBooking} // 🔹 Passiamo la prenotazione da modificare
                    setEditingBooking={setEditingBooking} // 🔹 Permette di resettare dopo il salvataggio
                />
            )}

            <BookingDetailsPopup
                selectedBooking={selectedBooking}
                setSelectedBooking={setSelectedBooking}
                selectedRoom={selectedRoom}
            />

            <MonthlySummary summary={monthlySummary} />
        </div>
    );
};

export default SummarySection;
