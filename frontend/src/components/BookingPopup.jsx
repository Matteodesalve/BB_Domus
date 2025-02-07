import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookingPopup = ({ selectedDate, setShowPopup, selectedRoom, setBookings, bookings, fetchBookings, selectedMonth, editingBooking, setEditingBooking }) => {
    const initialGuestData = {
        firstName: "",
        lastName: "",
        birthDate: null,
        exemption: "nessuna",
    };

    const maxGuests = selectedRoom === "Cremera" ? 4 : 2;
    

    const [numGuests, setNumGuests] = useState(maxGuests);
    const [guests, setGuests] = useState(() => {
        if (editingBooking) {
            return editingBooking.guests.slice(0, maxGuests).concat(
                Array(maxGuests - editingBooking.guests.length).fill().map(() => ({ ...initialGuestData }))
            );
        }
        return Array(maxGuests).fill().map(() => ({ ...initialGuestData }));
    });
    const [currentGuestIndex, setCurrentGuestIndex] = useState(0);



    const initialBookingData = {
        stayEndDate: null,
        touristTax: 0,
        stayCost: "",
        bookingSource: "booking",
        roomType: selectedRoom === "Robinie" ? "" : "appartamento",
    };

    const [bookingData, setBookingData] = useState(editingBooking ? {
        ...editingBooking,
    } : {
        stayEndDate: null,
        touristTax: 0,
        stayCost: "",
        bookingSource: "booking",
        roomType: selectedRoom === "Robinie" ? "" : "appartamento",
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [disabledRooms, setDisabledRooms] = useState({ Trevi: false, SPeter: false });
    
    const calculateTouristTax = () => {
        const calculateTaxForGuest = (guest) => {
            if (!guest.firstName || !guest.lastName || !guest.birthDate) return 0;

            const age = new Date().getFullYear() - new Date(guest.birthDate).getFullYear();
            const nights = bookingData.stayEndDate
                ? Math.round((new Date(bookingData.stayEndDate) - new Date(selectedDate)) / (1000 * 60 * 60 * 24)) // ✅ FIX: Arrotonda
                : 0;

            console.log(`🟢 Notti calcolate (FIXED): ${nights}`);

            if (guest.exemption === "Residente" || guest.exemption === "Clinica Guarnieri" || guest.exemption === "Forze dell'Ordine" || age < 10 || age > 65) {
                return 0;
            }

            return nights > 0 ? nights * 6 : 0;
        };

        const totalTax = guests.slice(0, numGuests).reduce((total, guest) => total + calculateTaxForGuest(guest), 0);

        console.log(`🟢 Tassa totale calcolata (FIXED): ${totalTax}`);

        return Number(totalTax.toFixed(2)); // 🔹 Arrotonda sempre a due decimali
    };

    const [touristTaxState, setTouristTaxState] = useState(editingBooking ? editingBooking.touristTax : calculateTouristTax());

    useEffect(() => {
        setTouristTaxState(calculateTouristTax());
    }, [bookingData.stayEndDate, guests]); // ✅ Si aggiorna quando cambia la data di fine soggiorno o gli ospiti

    useEffect(() => {
        validateForm();
    }, [guests, bookingData, numGuests]);

    useEffect(() => {
        if (selectedDate && bookings) {
            checkRoomAvailability();
        }
    }, [selectedDate, bookings]);

    const validateForm = () => {
        const isGuestValid = (guest) =>
            guest.firstName.trim() !== "" && guest.lastName.trim() !== "" && guest.birthDate;

        const atLeastOneGuestValid = guests.slice(0, numGuests).some(isGuestValid);
        const noPartialGuests = guests.slice(0, numGuests).every(
            (guest) =>
                (guest.firstName.trim() === "" && guest.lastName.trim() === "" && !guest.birthDate) ||
                isGuestValid(guest)
        );

        setIsFormValid(
            atLeastOneGuestValid &&
            noPartialGuests &&
            bookingData.stayEndDate &&
            (selectedRoom === "Robinie" ? bookingData.roomType !== "" : true) &&
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

    const handleNumGuestsChange = (e) => {
        const newNumGuests = parseInt(e.target.value, 10);
        setNumGuests(newNumGuests);
        setCurrentGuestIndex(0); // Reset per iniziare con il primo ospite
    };

    const handleGuestSelectChange = (e) => {
        setCurrentGuestIndex(parseInt(e.target.value, 10));
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
        const stayEndDateKey = formatDateForDatabase(bookingData.stayEndDate);
        const room = selectedRoom;
        const subRoom = selectedRoom === "Robinie" ? bookingData.roomType : "appartamento";

        // 🔹 Se si sta modificando una prenotazione, controlla se la data di fine soggiorno è cambiata
        const hasEndDateChanged = editingBooking && formatDateForDatabase(editingBooking.stayEndDate) !== stayEndDateKey;

        // 🔹 Se la data di fine soggiorno è stata modificata, ricalcola la tassa, altrimenti mantieni quella originale
        const finalTouristTax = (editingBooking && !hasEndDateChanged) ? editingBooking.touristTax : calculateTouristTax();


        const checkInMonth = selectedDate.getMonth();
        const checkOutMonth = bookingData.stayEndDate ? new Date(bookingData.stayEndDate).getMonth() : checkInMonth;

        const calculateTouristTaxForPeriod = (startDate, endDate) => {
            let tax = 0;
            for (let guest of guests) {
                if (!guest.firstName || !guest.lastName || !guest.birthDate) continue;

                const age = new Date().getFullYear() - new Date(guest.birthDate).getFullYear();
                if (guest.exemption === "Residente" || guest.exemption === "Clinica Guarnieri" || guest.exemption === "Forze dell'Ordine" || age < 10 || age > 65) {
                    continue;
                }

                let nights = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
                tax += nights * 6;
            }
            return tax;
        };

        let bookingsToSave = [];

        // Se la prenotazione è nello stesso mese
        if (checkInMonth === checkOutMonth) {
            bookingsToSave.push({
                room,
                subRoom,
                date: dateKey,
                bookingData: {
                    ...bookingData,
                    touristTax: finalTouristTax,
                    birthDate: guests.map((g) => formatDateForDatabase(g.birthDate)),
                    stayEndDate: stayEndDateKey,
                    guests,
                }
            });
        } else {
            // 🔹 Suddivisione della tassa di soggiorno tra i due mesi
            const lastDayOfCheckInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
            const firstDayOfNextMonth = new Date(bookingData.stayEndDate);
            firstDayOfNextMonth.setDate(1); // Imposta il primo giorno del mese successivo

            const nextMonthKey = formatDateForDatabase(firstDayOfNextMonth);

            // 🟢 FIX: Assicuriamoci che il calcolo includa l'ultima notte del primo mese
            const taxFirstMonth = calculateTouristTaxForPeriod(selectedDate, new Date(lastDayOfCheckInMonth.setDate(lastDayOfCheckInMonth.getDate() + 1)));
            const taxNextMonth = calculateTouristTaxForPeriod(firstDayOfNextMonth, bookingData.stayEndDate);

            // 🔹 Prenotazione principale (mese di check-in)
            bookingsToSave.push({
                room,
                subRoom,
                date: dateKey,
                bookingData: {
                    ...bookingData,
                    touristTax: taxFirstMonth,
                    birthDate: guests.map((g) => formatDateForDatabase(g.birthDate)),
                    stayEndDate: stayEndDateKey,
                    guests,
                }
            });

            // 🔹 Prenotazione fittizia (mese di check-out)
            bookingsToSave.push({
                room,
                subRoom,
                date: nextMonthKey,
                bookingData: {
                    ...bookingData,
                    stayCost: "0 €",
                    touristTax: taxNextMonth,
                    realCheckIn: dateKey, // 🔹 Campo aggiuntivo per indicare il check-in reale
                    stayEndDate: stayEndDateKey,
                    birthDate: guests.map((g) => formatDateForDatabase(g.birthDate)),
                    guests,
                }
            });
        }

        console.log(`🔹 Metodo: ${editingBooking ? "PUT (modifica)" : "POST (nuova prenotazione)"}`);
        console.log("📌 Dati inviati:", JSON.stringify(bookingsToSave, null, 2));

        try {
            await Promise.all(bookingsToSave.map(async (booking) => {
                const response = await fetch(`/api/bookings/${editingBooking ? "update" : "save"}`, {
                    method: editingBooking ? "PUT" : "POST", // 🔹 Se stiamo modificando, usa PUT
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(booking),
                });

                const result = await response.json();
                if (!result.success) {
                    throw new Error("Errore nel salvataggio: " + result.message);
                }
            }));

            alert(`Prenotazione ${editingBooking ? "modificata" : "salvata"} con successo!`);
            setBookings((prevBookings) => [...prevBookings, ...bookingsToSave]);
            fetchBookings(selectedRoom, selectedRoom === "Robinie" ? "all" : "appartamento", selectedMonth);
            setEditingBooking(null); // 🔹 Reset modifica
            setShowPopup(false);
        } catch (error) {
            console.error("Errore di connessione:", error);
            alert("Errore di connessione al server.");
        }
    };




    const handleClosePopup = () => {
        setEditingBooking(null);
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

    const handleGuestSwitch = (index) => {
        setCurrentGuestIndex(index);
    }


    return (
        <div className="popup-overlay">
            <div className="popup">
                <h3>{editingBooking ? "Modifica Prenotazione" : `Prenotazione per il ${selectedDate.toLocaleDateString()}`}</h3>

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

                {selectedRoom === "Cremera" ? (
                    <>
                        <label>Ospite</label>
                        <select value={currentGuestIndex} onChange={handleGuestSelectChange}>
                            {[...Array(numGuests)].map((_, index) => (
                                <option key={index} value={index}>
                                    Ospite {index + 1}
                                </option>
                            ))}
                        </select>
                    </>
                ) : (
                    <div className="guest-switch-container">
                        {[...Array(2)].map((_, index) => (
                            <button
                                key={index}
                                className={`guest-button ${currentGuestIndex === index ? "active" : ""}`}
                                onClick={() => handleGuestSwitch(index)}
                            >
                                Ospite {index + 1}
                            </button>
                        ))}
                    </div>
                )}

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
                <input type="text" className="cost-input" value={touristTaxState + " €"} readOnly disabled />


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
