const Seat = require("../models/Seat");
const Reservation = require("../models/Reservation");

async function createBooking(req, res) {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Reservation token required" });

  const reservation = await Reservation.findOne({ token });
  if (!reservation) return res.status(410).json({ error: "Reservation not found or expired" });

  if (reservation.userId.toString() !== req.userId) {
    return res.status(403).json({ error: "Reservation belongs to another user" });
  }

  if (reservation.expiresAt.getTime() <= Date.now()) {
    await Seat.updateMany(
      { eventId: reservation.eventId, reservationId: token, status: "reserved" },
      { $set: { status: "available", reservationId: null } }
    );
    await Reservation.deleteOne({ token });
    return res.status(410).json({ error: "Reservation has expired" });
  }

  await Seat.updateMany(
    { eventId: reservation.eventId, reservationId: token, status: "reserved" },
    { $set: { status: "booked", reservationId: null } }
  );
  await Reservation.deleteOne({ token });

  return res.status(201).json({
    eventId: reservation.eventId,
    seatNumbers: reservation.seatNumbers,
    status: "booked",
  });
}

module.exports = { createBooking };
