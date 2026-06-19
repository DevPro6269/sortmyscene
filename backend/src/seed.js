require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("./config/db");
const Event = require("./models/Event");
const Seat = require("./models/Seat");

function seatLabels(total) {
  const labels = [];
  const perRow = 10;
  for (let i = 0; i < total; i++) {
    const row = String.fromCharCode(65 + Math.floor(i / perRow));
    const col = (i % perRow) + 1;
    labels.push(`${row}${col}`);
  }
  return labels;
}

async function seed() {
  await connectDB(process.env.MONGO_URI);
  await Promise.all([Event.deleteMany({}), Seat.deleteMany({})]);

  const eventsData = [
    { name: "Coldplay Live", dateTime: new Date("2026-08-01T19:00:00Z"), venue: "Wembley", totalSeats: 30 },
    { name: "Tech Conf 2026", dateTime: new Date("2026-09-15T09:00:00Z"), venue: "Expo Hall", totalSeats: 20 },
  ];

  for (const data of eventsData) {
    const event = await Event.create(data);
    const seats = seatLabels(event.totalSeats).map((seatNumber) => ({
      eventId: event._id,
      seatNumber,
      status: "available",
    }));
    await Seat.insertMany(seats);
    console.log(`Seeded ${event.name} with ${seats.length} seats`);
  }

  await mongoose.disconnect();
  console.log("Seed complete");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
