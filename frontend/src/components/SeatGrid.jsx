import Seat from "./Seat";

export default function SeatGrid({ seats, selected, onToggle }) {
  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs">
        <Legend className="bg-green-500" label="Available" />
        <Legend className="bg-indigo-600" label="Selected" />
        <Legend className="bg-yellow-400" label="Reserved" />
        <Legend className="bg-red-500" label="Booked" />
      </div>
      <div className="grid grid-cols-10 gap-2">
        {seats.map((seat) => (
          <Seat key={seat.seatNumber} seat={seat} selected={selected.includes(seat.seatNumber)} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

function Legend({ className, label }) {
  return (
    <span className="flex items-center gap-1">
      <span className={`inline-block h-3 w-3 rounded ${className}`} />
      {label}
    </span>
  );
}
