const mongoose = require("mongoose");
const Event = require("../models/Event");
const Seat = require("../models/Seat");

async function listEvents(req, res) {
  const events = await Event.find().sort({ dateTime: 1 });
  return res.json(events);
}

async function getEvent(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Event not found" });
  }
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  const seats = await Seat.find({ eventId: event._id }).sort({ seatNumber: 1 });
  return res.json({
    event,
    seats: seats.map((s) => ({ seatNumber: s.seatNumber, status: s.status })),
  });
}

module.exports = { listEvents, getEvent };
