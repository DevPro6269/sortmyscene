const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createApp } = require("../src/app");

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe("auth", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "a@b.com", password: "secret123" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it("rejects duplicate email", async () => {
    await request(app).post("/api/auth/register").send({ email: "dup@b.com", password: "secret123" });
    const res = await request(app).post("/api/auth/register").send({ email: "dup@b.com", password: "secret123" });
    expect(res.status).toBe(409);
  });

  it("logs in with correct credentials", async () => {
    await request(app).post("/api/auth/register").send({ email: "c@b.com", password: "secret123" });
    const res = await request(app).post("/api/auth/login").send({ email: "c@b.com", password: "secret123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects bad password", async () => {
    await request(app).post("/api/auth/register").send({ email: "d@b.com", password: "secret123" });
    const res = await request(app).post("/api/auth/login").send({ email: "d@b.com", password: "wrong" });
    expect(res.status).toBe(401);
  });
});
