const crypto = require("crypto");
const Seat = require("../models/Seat");
const Reservation = require("../models/Reservation");

const HOLD_MS = 10 * 60 * 1000; // 10 minutes

async function reserve(req, res) {
  const { eventId, seatNumbers } = req.body || {};
  if (!eventId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
    return res.status(400).json({ error: "eventId and non-empty seatNumbers required" });
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + HOLD_MS);

  const result = await Seat.updateMany(
    { eventId, seatNumber: { $in: seatNumbers }, status: "available" },
    { $set: { status: "reserved", reservationId: token, updatedAt: new Date() } }
  );

  if (result.modifiedCount !== seatNumbers.length) {
    await Seat.updateMany(
      { eventId, reservationId: token },
      { $set: { status: "available", reservationId: null } }
    );
    return res.status(409).json({ error: "Some seats are no longer available", seatNumbers });
  }

  await Reservation.create({
    token,
    userId: req.userId,
    eventId,
    seatNumbers,
    expiresAt,
  });

  return res.status(201).json({ token, eventId, seatNumbers, expiresAt });
}

module.exports = { reserve };
