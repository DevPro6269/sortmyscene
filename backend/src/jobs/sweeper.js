const Seat = require("../models/Seat");
const Reservation = require("../models/Reservation");

// Releases seats whose reservation has expired or no longer exists.
async function sweepExpired() {
  const now = new Date();
  const expired = await Reservation.find({ expiresAt: { $lte: now } });
  for (const r of expired) {
    await Seat.updateMany(
      { eventId: r.eventId, reservationId: r.token, status: "reserved" },
      { $set: { status: "available", reservationId: null } }
    );
    await Reservation.deleteOne({ _id: r._id });
  }
  // Safety net: any reserved seat whose reservation token is gone (TTL removed it).
  const liveTokens = (await Reservation.find({}, { token: 1 })).map((r) => r.token);
  if (liveTokens.length > 0) {
    await Seat.updateMany(
      { status: "reserved", reservationId: { $nin: liveTokens } },
      { $set: { status: "available", reservationId: null } }
    );
  }
}

function startSweeper(intervalMs = 60 * 1000) {
  setInterval(() => {
    sweepExpired().catch((e) => console.error("Sweeper error", e));
  }, intervalMs);
}

module.exports = { sweepExpired, startSweeper };
