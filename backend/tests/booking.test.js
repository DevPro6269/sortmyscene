const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createApp } = require("../src/app");
const Event = require("../src/models/Event");
const Seat = require("../src/models/Seat");
const Reservation = require("../src/models/Reservation");

let mongod, app;

async function makeUserToken(email) {
  const res = await request(app).post("/api/auth/register").send({ email, password: "secret123" });
  return res.body.token;
}
async function makeEventWithSeats(total) {
  const event = await Event.create({ name: "E", dateTime: new Date(), venue: "V", totalSeats: total });
  const seats = [];
  for (let i = 1; i <= total; i++) seats.push({ eventId: event._id, seatNumber: `A${i}`, status: "available" });
  await Seat.insertMany(seats);
  return event;
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
afterEach(async () => {
  await Promise.all([Event.deleteMany({}), Seat.deleteMany({}), Reservation.deleteMany({})]);
});

describe("bookings", () => {
  it("books a valid reservation and flips seats to booked", async () => {
    const token = await makeUserToken(`bk1_${Date.now()}@b.com`);
    const event = await makeEventWithSeats(5);
    const reserveRes = await request(app)
      .post("/api/reserve")
      .set("Authorization", `Bearer ${token}`)
      .send({ eventId: event._id.toString(), seatNumbers: ["A1", "A2"] });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ token: reserveRes.body.token });

    expect(res.status).toBe(201);
    const seats = await Seat.find({ eventId: event._id, seatNumber: { $in: ["A1", "A2"] } });
    expect(seats.every((s) => s.status === "booked")).toBe(true);
    const reservation = await Reservation.findOne({ token: reserveRes.body.token });
    expect(reservation).toBeNull();
  });

  it("rejects booking an expired reservation with 410", async () => {
    const token = await makeUserToken(`bk2_${Date.now()}@b.com`);
    const event = await makeEventWithSeats(5);
    const reserveRes = await request(app)
      .post("/api/reserve")
      .set("Authorization", `Bearer ${token}`)
      .send({ eventId: event._id.toString(), seatNumbers: ["A1"] });

    await Reservation.updateOne({ token: reserveRes.body.token }, { $set: { expiresAt: new Date(Date.now() - 1000) } });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${token}`)
      .send({ token: reserveRes.body.token });
    expect(res.status).toBe(410);
  });

  it("rejects booking a reservation owned by another user with 403", async () => {
    const owner = await makeUserToken(`o1_${Date.now()}@b.com`);
    const other = await makeUserToken(`o2_${Date.now()}@b.com`);
    const event = await makeEventWithSeats(5);
    const reserveRes = await request(app)
      .post("/api/reserve")
      .set("Authorization", `Bearer ${owner}`)
      .send({ eventId: event._id.toString(), seatNumbers: ["A1"] });

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${other}`)
      .send({ token: reserveRes.body.token });
    expect(res.status).toBe(403);
  });
});
