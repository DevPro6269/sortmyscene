import { Link } from "react-router-dom";

export default function EventCard({ event }) {
  return (
    <Link to={`/events/${event._id}`}
      className="block rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md">
      <h2 className="text-lg font-semibold">{event.name}</h2>
      <p className="text-sm text-gray-600">{event.venue}</p>
      <p className="text-sm text-gray-500">{new Date(event.dateTime).toLocaleString()}</p>
      <p className="mt-2 text-xs text-gray-400">{event.totalSeats} seats</p>
    </Link>
  );
}
