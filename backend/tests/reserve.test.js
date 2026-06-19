const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createApp } = require("../src/app");
const Event = require("../src/models/Event");
const Seat = require("../src/models/Seat");

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
  await Promise.all([Event.deleteMany({}), Seat.deleteMany({})]);
});

describe("reserve", () => {
  it("reserves available seats and returns expiresAt", async () => {
    const token = await makeUserToken(`r1_${Date.now()}@b.com`);
    const event = await makeEventWithSeats(5);
    const res = await request(app)
      .post("/api/reserve")
      .set("Authorization", `Bearer ${token}`)
      .send({ eventId: event._id.toString(), seatNumbers: ["A1", "A2"] });
    expect(res.status).toBe(201);
    expect(res.body.expiresAt).toBeDefined();
    expect(res.body.token).toBeDefined();
    const seats = await Seat.find({ eventId: event._id, seatNumber: { $in: ["A1", "A2"] } });
    expect(seats.every((s) => s.status === "reserved")).toBe(true);
  });

  it("requires auth", async () => {
    const event = await makeEventWithSeats(3);
    const res = await request(app).post("/api/reserve").send({ eventId: event._id.toString(), seatNumbers: ["A1"] });
    expect(res.status).toBe(401);
  });

  it("only one of two concurrent reserves wins the same seat", async () => {
    const t1 = await makeUserToken(`c1_${Date.now()}@b.com`);
    const t2 = await makeUserToken(`c2_${Date.now()}@b.com`);
    const event = await makeEventWithSeats(5);
    const body = { eventId: event._id.toString(), seatNumbers: ["A1"] };

    const [a, b] = await Promise.all([
      request(app).post("/api/reserve").set("Authorization", `Bearer ${t1}`).send(body),
      request(app).post("/api/reserve").set("Authorization", `Bearer ${t2}`).send(body),
    ]);

    const statuses = [a.status, b.status].sort();
    expect(statuses).toEqual([201, 409]);
    const seat = await Seat.findOne({ eventId: event._id, seatNumber: "A1" });
    expect(seat.status).toBe("reserved");
  });

  it("rolls back partially-available reservations and returns 409", async () => {
    const t1 = await makeUserToken(`p1_${Date.now()}@b.com`);
    const t2 = await makeUserToken(`p2_${Date.now()}@b.com`);
    const event = await makeEventWithSeats(5);
    await request(app).post("/api/reserve").set("Authorization", `Bearer ${t1}`).send({ eventId: event._id.toString(), seatNumbers: ["A2"] });
    const res = await request(app).post("/api/reserve").set("Authorization", `Bearer ${t2}`).send({ eventId: event._id.toString(), seatNumbers: ["A1", "A2"] });
    expect(res.status).toBe(409);
    const a1 = await Seat.findOne({ eventId: event._id, seatNumber: "A1" });
    expect(a1.status).toBe("available");
  });
});
