import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const BookingCalendar = ({ selectedDate, onDayClick }) => {
    return (
        <div className="calendar-container">
            <Calendar
                onChange={onDayClick}
                value={selectedDate}
                activeStartDate={selectedDate}
            />
        </div>
    );
};

export default BookingCalendar;
