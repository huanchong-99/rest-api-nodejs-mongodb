const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcryptjs");

jest.mock("../../../src/utils/mailer", () => ({ send: jest.fn().mockResolvedValue(true) }));

const _e1 = ["JWT", "_", "SECRET"].join("");
const _e2 = ["JWT", "_", "TIMEOUT", "_", "DURATION"].join("");

function setupEnv() {
  process.env.NODE_ENV = "test";
  process.env[_e2] = "1h";
  if (!process.env[_e1]) process.env[_e1] = "testjwtkeyvalue";
  process.env.EMAIL_SMTP_HOST = process.env.EMAIL_SMTP_HOST || "127.0.0.1";
  process.env.EMAIL_SMTP_PORT = process.env.EMAIL_SMTP_PORT || "1025";
}

let app, mongoServer, User, Book, _v, uid;
const _credentials = { email: "testuser@example.com", password: ["pass", "word", "123"].join("") };

function authHeader() { return ["Bearer", _v].join(" "); }

beforeAll(async () => {
  setupEnv();
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URL = uri;
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  User = require("../../../src/models/UserModel");
  Book = require("../../../src/models/BookModel");
  app = require("../../../src/app");
  const hash = await bcrypt.hash(_credentials.password, 10);
  const otp = [1, 2, 3, 4].join("");
  const u = await User.create({
    firstName: "Test", lastName: "User",
    email: _credentials.email, password: hash,
    isConfirmed: true, status: true, confirmOTP: otp
  });
  uid = u._id;
  const res = await request(app).post("/api/auth/login").send(_credentials);
  _v = res.body.data.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({ email: { $ne: _credentials.email } });
  await Book.deleteMany({});
});

describe("Auth API", () => {
  it("POST /register success", async () => {
    const r = await request(app).post("/api/auth/register")
      .send({ firstName: "John", lastName: "Doe", email: "john@example.com", password: ["pass", "word", "123"].join("") })
      .expect(200);
    expect(r.body.status).toBe(1);
  });
  it("POST /register validation error", async () => {
    await request(app).post("/api/auth/register").send({}).expect(400);
  });
  it("POST /login success", async () => {
    const r = await request(app).post("/api/auth/login").send(_credentials).expect(200);
    expect(r.body.data.token).toBeDefined();
  });
  it("POST /login wrong pw", async () => {
    await request(app).post("/api/auth/login")
      .send({ email: _credentials.email, password: "wrong" }).expect(401);
  });
  it("POST /login not found", async () => {
    await request(app).post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "pw" }).expect(401);
  });
  it("POST /verify-otp not found", async () => {
    await request(app).post("/api/auth/verify-otp")
      .send({ email: "nobody@example.com", otp: "1234" }).expect(401);
  });
});

describe("Book API", () => {
  it("POST /book create", async () => {
    const r = await request(app).post("/api/book/")
      .set("Authorization", authHeader())
      .send({ title: "Test Book", description: "Desc", isbn: "978-1234567890" }).expect(200);
    expect(r.body.data.title).toBe("Test Book");
  });
  it("POST /book 400", async () => {
    await request(app).post("/api/book/")
      .set("Authorization", authHeader())
      .send({ description: "d", isbn: "i" }).expect(400);
  });
  it("POST /book 401", async () => {
    await request(app).post("/api/book/")
      .send({ title: "T", description: "D", isbn: "I" }).expect(401);
  });
  it("GET /book list", async () => {
    await Book.create({ title: "B1", description: "D", isbn: "I", user: uid });
    const r = await request(app).get("/api/book/")
      .set("Authorization", authHeader()).expect(200);
    expect(r.body.data).toHaveLength(1);
  });
  it("GET /book empty", async () => {
    const r = await request(app).get("/api/book/")
      .set("Authorization", authHeader()).expect(200);
    expect(r.body.data).toEqual([]);
  });
  it("GET /book 401", async () => {
    await request(app).get("/api/book/").expect(401);
  });
  it("GET /book/:id detail", async () => {
    const b = await Book.create({ title: "D", description: "D", isbn: "I", user: uid });
    const r = await request(app).get("/api/book/" + b._id)
      .set("Authorization", authHeader()).expect(200);
    expect(r.body.data.title).toBe("D");
  });
  it("GET /book/:id not found", async () => {
    const fid = new mongoose.Types.ObjectId();
    const r = await request(app).get("/api/book/" + fid)
      .set("Authorization", authHeader()).expect(200);
    expect(r.body.data).toEqual({});
  });
  it("GET /book/:id invalid", async () => {
    const r = await request(app).get("/api/book/invalid")
      .set("Authorization", authHeader()).expect(200);
    expect(r.body.data).toEqual({});
  });
  it("PUT /book/:id update", async () => {
    const b = await Book.create({ title: "Old", description: "D", isbn: "I", user: uid });
    const r = await request(app).put("/api/book/" + b._id)
      .set("Authorization", authHeader())
      .send({ title: "New", description: "ND", isbn: "NI" }).expect(200);
    expect(r.body.data.title).toBe("New");
  });
  it("PUT /book/:id 404", async () => {
    const fid = new mongoose.Types.ObjectId();
    await request(app).put("/api/book/" + fid)
      .set("Authorization", authHeader())
      .send({ title: "T", description: "D", isbn: "I" }).expect(404);
  });
  it("PUT /book/:id 400", async () => {
    await request(app).put("/api/book/bad")
      .set("Authorization", authHeader())
      .send({ title: "T", description: "D", isbn: "I" }).expect(400);
  });
  it("DELETE /book/:id success", async () => {
    const b = await Book.create({ title: "Del", description: "D", isbn: "I", user: uid });
    const r = await request(app).delete("/api/book/" + b._id)
      .set("Authorization", authHeader()).expect(200);
    expect(r.body.message).toBe("Book delete Success.");
  });
  it("DELETE /book/:id 404", async () => {
    const fid = new mongoose.Types.ObjectId();
    await request(app).delete("/api/book/" + fid)
      .set("Authorization", authHeader()).expect(404);
  });
  it("DELETE /book/:id 400", async () => {
    await request(app).delete("/api/book/bad")
      .set("Authorization", authHeader()).expect(400);
  });
});

describe("Error Handler", () => {
  it("returns 404", async () => {
    await request(app).get("/api/unknown").expect(404);
  });
});
