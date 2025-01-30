import React from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';

const BookingCalendar = ({ selectedDate, onDayClick, bookings }) => {
    const getTileClassName = ({ date, view }) => {
        if (view !== "month") return "";

        const formattedDate = date.toISOString().split("T")[0]; // Converti in YYYY-MM-DD

        // Trova le prenotazioni che includono questa data
        const bookingsForDate = bookings.filter(booking => {
            const checkInDate = new Date(booking.id);
            let checkOutDate = new Date(booking.stayEndDate);

            // Sottrai un giorno dal check-out per escluderlo dalla colorazione
            checkOutDate.setDate(checkOutDate.getDate() - 1);
            checkInDate.setDate(checkInDate.getDate() - 1);

            return date >= checkInDate && date <= checkOutDate;
        });

        if (bookingsForDate.length === 0) return ""; // Nessuna prenotazione

        // Controlla se ci sono prenotazioni per entrambe le camere
        const hasTrevi = bookingsForDate.some(booking => booking.roomType === "Trevi");
        const hasSPeter = bookingsForDate.some(booking => booking.roomType === "S.Peter");

        if (hasTrevi && hasSPeter) return "half-red-blue"; // Metà rosso e metà blu
        if (hasTrevi) return "red"; // Rosso per Trevi
        if (hasSPeter) return "blue"; // Blu per San Peter

        return "";
    };

    const isDayDisabled = ({ date, view }) => {
        if (view !== "month") return false;

        const formattedDate = date.toISOString().split("T")[0];

        // Contiamo le prenotazioni per questa data
        const bookingsForDate = bookings.filter(booking => {
            const checkInDate = new Date(booking.id);
            let checkOutDate = new Date(booking.stayEndDate);

            // Sottrai un giorno dal check-out per considerare solo i giorni occupati
            checkOutDate.setDate(checkOutDate.getDate() - 1);
            checkInDate.setDate(checkInDate.getDate() - 1);

            return date >= checkInDate && date <= checkOutDate;
        });

        return bookingsForDate.length >= 2; // Disabilita se entrambe le camere sono occupate
    };

    return (
        <div className="calendar-container">
            <Calendar
                onChange={onDayClick}
                value={selectedDate}
                tileClassName={({ date, view }) => {
                    const className = getTileClassName({ date, view });
                    return isDayDisabled({ date, view }) ? `${className} disabled` : className;
                }}
                tileDisabled={isDayDisabled}
            />
        </div>
    );
};

export default BookingCalendar;
