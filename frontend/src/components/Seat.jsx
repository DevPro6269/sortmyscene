const STATUS_STYLES = {
  available: "bg-green-500 hover:bg-green-600 text-white cursor-pointer",
  reserved: "bg-yellow-400 text-white cursor-not-allowed",
  booked: "bg-red-500 text-white cursor-not-allowed",
};

export default function Seat({ seat, selected, onToggle }) {
  const selectable = seat.status === "available";
  const base = selected ? "bg-indigo-600 text-white ring-2 ring-indigo-800" : STATUS_STYLES[seat.status];
  return (
    <button
      disabled={!selectable}
      onClick={() => selectable && onToggle(seat.seatNumber)}
      className={`h-10 w-10 rounded text-xs font-semibold ${base}`}
      title={`${seat.seatNumber} — ${seat.status}`}
    >
      {seat.seatNumber}
    </button>
  );
}
