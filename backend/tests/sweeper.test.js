const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Event = require("../src/models/Event");
const Seat = require("../src/models/Seat");
const Reservation = require("../src/models/Reservation");
const { sweepExpired } = require("../src/jobs/sweeper");

let mongod;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
afterEach(async () => {
  await Promise.all([Event.deleteMany({}), Seat.deleteMany({}), Reservation.deleteMany({})]);
});

describe("sweeper", () => {
  it("releases seats from expired reservations", async () => {
    const event = await Event.create({ name: "E", dateTime: new Date(), venue: "V", totalSeats: 2 });
    await Seat.insertMany([
      { eventId: event._id, seatNumber: "A1", status: "reserved", reservationId: "tok1" },
    ]);
    await Reservation.create({ token: "tok1", userId: new mongoose.Types.ObjectId(), eventId: event._id, seatNumbers: ["A1"], expiresAt: new Date(Date.now() - 1000) });
    await sweepExpired();
    const seat = await Seat.findOne({ seatNumber: "A1" });
    expect(seat.status).toBe("available");
    expect(seat.reservationId).toBeNull();
  });

  it("does NOT free actively-held seats when there are no expired reservations", async () => {
    const event = await Event.create({ name: "E", dateTime: new Date(), venue: "V", totalSeats: 2 });
    await Seat.insertMany([
      { eventId: event._id, seatNumber: "A1", status: "reserved", reservationId: "live1" },
    ]);
    await Reservation.create({ token: "live1", userId: new mongoose.Types.ObjectId(), eventId: event._id, seatNumbers: ["A1"], expiresAt: new Date(Date.now() + 60000) });
    await sweepExpired();
    const seat = await Seat.findOne({ seatNumber: "A1" });
    expect(seat.status).toBe("reserved");
  });
});
