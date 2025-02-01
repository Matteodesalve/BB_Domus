import React from "react";

const MonthSelection = ({ selectedMonth, onSelectMonth }) => {
    const months = [
        "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
        "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
    ];

    return (
        <div className="month-buttons">
            {months.map((month, index) => (
                <button
                    key={month}
                    className={selectedMonth === index ? "active" : ""}
                    onClick={() => onSelectMonth(index)}
                >
                    {month}
                </button>
            ))}
        </div>
    );
};

export default MonthSelection;
