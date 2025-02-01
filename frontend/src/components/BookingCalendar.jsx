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
    
        bookings.forEach((booking) => {
            const checkInDate = new Date(booking.id);
            const checkOutDate = new Date(booking.stayEndDate);
    
            checkOutDate.setDate(checkOutDate.getDate() - 1);
            checkInDate.setDate(checkInDate.getDate() - 1);
    
            // ✅ Controllo avanzato: anche prenotazioni che iniziano il mese scorso e finiscono ora
            if (date >= checkInDate && date <= checkOutDate) {
                if (selectedRoom === "Robinie") {
                    if (booking.roomType === "Trevi") tileClass = "red"; 
                    else if (booking.roomType === "S.Peter") tileClass = "blue";
                } else if (selectedRoom === "Cremera") {
                    tileClass = "yellow"; 
                }
            }
    
            // 🔹 NUOVO: Controllo retroattivo per prenotazioni iniziate nel mese precedente
            const prevMonth = new Date(date);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
    
            if (checkOutDate.getMonth() === date.getMonth() && checkOutDate.getFullYear() === date.getFullYear()) {
                if (date >= checkInDate && date <= checkOutDate) {
                    if (selectedRoom === "Robinie") {
                        if (booking.roomType === "Trevi") tileClass = "red";
                        else if (booking.roomType === "S.Peter") tileClass = "blue";
                    } else if (selectedRoom === "Cremera") {
                        tileClass = "yellow";
                    }
                }
            }
        });
    
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
