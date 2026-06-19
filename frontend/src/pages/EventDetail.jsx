import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import SeatGrid from "../components/SeatGrid";
import CountdownTimer from "../components/CountdownTimer";
import Banner from "../components/Banner";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [reservation, setReservation] = useState(null); // { token, expiresAt }
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const loadEvent = useCallback(async () => {
    const res = await client.get(`/events/${id}`);
    setEvent(res.data.event);
    setSeats(res.data.seats);
  }, [id]);

  useEffect(() => {
    loadEvent().catch((err) => setError(err.response?.data?.error || "Failed to load event"));
  }, [loadEvent]);

  function toggleSeat(seatNumber) {
    setSelected((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    );
  }

  async function onReserve() {
    setError(""); setSuccess(""); setBusy(true);
    try {
      const res = await client.post("/reserve", { eventId: id, seatNumbers: selected });
      setReservation({ token: res.data.token, expiresAt: res.data.expiresAt });
      await loadEvent();
    } catch (err) {
      setError(err.response?.data?.error || "Could not reserve seats");
      setSelected([]);
      await loadEvent();
    } finally {
      setBusy(false);
    }
  }

  async function onConfirm() {
    setError(""); setSuccess(""); setBusy(true);
    try {
      await client.post("/bookings", { token: reservation.token });
      setSuccess(`Booked seats: ${selected.join(", ")}`);
      setReservation(null);
      setSelected([]);
      await loadEvent();
    } catch (err) {
      setError(err.response?.data?.error || "Booking failed");
      setReservation(null);
      setSelected([]);
      await loadEvent();
    } finally {
      setBusy(false);
    }
  }

  function onExpire() {
    setReservation(null);
    setSelected([]);
    setError("Your reservation expired. Please select seats again.");
    loadEvent();
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-gray-600">{event.venue} — {new Date(event.dateTime).toLocaleString()}</p>
      </div>

      <Banner type="error" onClose={() => setError("")}>{error}</Banner>
      <Banner type="success" onClose={() => setSuccess("")}>{success}</Banner>

      <SeatGrid seats={seats} selected={selected} onToggle={toggleSeat} />

      <div className="flex items-center gap-4">
        {!reservation ? (
          <button
            disabled={busy || selected.length === 0}
            onClick={onReserve}
            className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
            Reserve {selected.length > 0 ? `(${selected.length})` : ""}
          </button>
        ) : (
          <>
            <span className="text-sm">
              Hold expires in <CountdownTimer expiresAt={reservation.expiresAt} onExpire={onExpire} />
            </span>
            <button
              disabled={busy}
              onClick={onConfirm}
              className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              Confirm Booking
            </button>
          </>
        )}
      </div>
    </div>
  );
}
