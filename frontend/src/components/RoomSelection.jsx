import React from "react";

const RoomSelection = ({ selectedRoom, onSelectRoom }) => {
    const rooms = ["Robinie", "Cremera"];

    return (
        <div className="room-buttons">
            {rooms.map((room) => (
                <button
                    key={room}
                    className={selectedRoom === room ? "active" : ""}
                    onClick={() => onSelectRoom(room)}
                >
                    {room}
                </button>
            ))}
        </div>
    );
};

export default RoomSelection;
