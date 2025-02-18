import React from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { useEffect, useState } from "react";

const BookingCalendar = ({ selectedDate, onDayClick, bookings, selectedMonth, selectedRoom }) => {

    const [calendarKey, setCalendarKey] = useState(0);

    useEffect(() => {
        // 🔄 Forza il ricaricamento del calendario ogni volta che le prenotazioni cambiano
        setCalendarKey((prevKey) => prevKey + 1);
    }, [bookings, selectedRoom, selectedMonth]);

    const getTileClassName = ({ date, view }) => {
        if (view !== "month") return "";

        let tileClass = "";
        let treviOccupied = false;
        let speterOccupied = false;

        bookings.forEach((booking) => {
            const checkInDate = new Date(booking.id);
            const checkOutDate = new Date(booking.stayEndDate);

            checkOutDate.setDate(checkOutDate.getDate() - 1);
            checkInDate.setDate(checkInDate.getDate() - 1);

            // ✅ Controllo se la data è all'interno del range della prenotazione
            if (date >= checkInDate && date <= checkOutDate) {
                if (selectedRoom === "Robinie") {
                    if (booking.roomType === "Trevi") treviOccupied = true;
                    if (booking.roomType === "S.Peter") speterOccupied = true;
                } else if (selectedRoom === "Cremera") {
                    tileClass = "yellow";
                }
            }
        });

        // 🟣 Gestione della sovrapposizione per Robinie (Trevi e S.Peter)
        if (selectedRoom === "Robinie") {
            if (treviOccupied && speterOccupied) {
                tileClass = "half-red-blue"; // Giorno sovrapposto
            } else if (treviOccupied) {
                tileClass = "red";
            } else if (speterOccupied) {
                tileClass = "blue";
            }
        }

        return tileClass;
    };
    

    const isDayDisabled = ({ date, view }) => {
        if (view !== "month") return false;
    
        let treviCount = 0;
        let speterCount = 0;
        let cremeraOccupied = false;
    
        bookings.forEach((booking) => {
            const checkInDate = new Date(booking.id);
            let checkOutDate = new Date(booking.stayEndDate);
    
            checkOutDate.setDate(checkOutDate.getDate() - 1);
            checkInDate.setDate(checkInDate.getDate() - 1);
    
            // ✅ Controllo migliorato per mesi successivi
            if (date >= checkInDate && date <= checkOutDate) {
                if (selectedRoom === "Robinie") {
                    if (booking.roomType === "Trevi") treviCount++;
                    if (booking.roomType === "S.Peter") speterCount++;
                } else if (selectedRoom === "Cremera") {
                    cremeraOccupied = true;
                }
            }
        });
    
        // 🔹 Se Robinie, disabilita il giorno se entrambe le camere sono occupate
        if (selectedRoom === "Robinie") {
            return treviCount > 0 && speterCount > 0;
        }
    
        // 🔹 Se Cremera, disabilita il giorno se è già prenotato
        if (selectedRoom === "Cremera") {
            return cremeraOccupied;
        }
    
        return false;
    };
    
    


    return (
        <div className="calendar-container">
            <Calendar
                key={calendarKey}
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
