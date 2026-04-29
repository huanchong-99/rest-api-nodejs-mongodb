const AppError = require("../../../src/utils/AppError");
describe("AppError", () => {
  it("creates error", () => { const e = new AppError("test", 400); expect(e.statusCode).toBe(400); expect(e.status).toBe("fail"); expect(e.isOperational).toBe(true); });
  it("error for 500", () => { expect(new AppError("x", 500).status).toBe("error"); });
  it("fail for 4xx", () => { expect(new AppError("x", 401).status).toBe("fail"); });
  it("has stack", () => { expect(new AppError("x", 400).stack).toBeDefined(); });
  it("instance of Error", () => { expect(new AppError("x", 400)).toBeInstanceOf(Error); });
});

const apiResponse = require("../../../src/utils/apiResponse");
function mr() { return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() }; }
describe("apiResponse", () => {
  let res; beforeEach(() => { res = mr(); });
  it("successResponse", () => { apiResponse.successResponse(res, "OK"); expect(res.status).toHaveBeenCalledWith(200); expect(res.json).toHaveBeenCalledWith({ status: 1, message: "OK" }); });
  it("successResponseWithData", () => { apiResponse.successResponseWithData(res, "OK", { id: 1 }); expect(res.json).toHaveBeenCalledWith({ status: 1, message: "OK", data: { id: 1 } }); });
  it("ErrorResponse", () => { apiResponse.ErrorResponse(res, "f"); expect(res.status).toHaveBeenCalledWith(500); expect(res.json).toHaveBeenCalledWith({ status: 0, message: "f" }); });
  it("notFoundResponse", () => { apiResponse.notFoundResponse(res, "m"); expect(res.status).toHaveBeenCalledWith(404); });
  it("validationErrorWithData", () => { apiResponse.validationErrorWithData(res, "b", { f: "x" }); expect(res.status).toHaveBeenCalledWith(400); });
  it("unauthorizedResponse", () => { apiResponse.unauthorizedResponse(res, "n"); expect(res.status).toHaveBeenCalledWith(401); });
});

const catchAsync = require("../../../src/utils/catchAsync");
const fp = () => new Promise(r => setImmediate(r));
describe("catchAsync", () => {
  let req, res, next; beforeEach(() => { req = {}; res = {}; next = jest.fn(); });
  it("calls handler", async () => { const h = jest.fn().mockResolvedValue(undefined); catchAsync(h)(req, res, next); await fp(); expect(h).toHaveBeenCalled(); });
  it("next on reject", async () => { const e = new Error("f"); const h = jest.fn().mockRejectedValue(e); catchAsync(h)(req, res, next); await fp(); expect(next).toHaveBeenCalledWith(e); });
});

const utility = require("../../../src/utils/utility");
describe("randomNumber", () => {
  it("returns number", () => { expect(typeof utility.randomNumber(4)).toBe("number"); });
  it("varies", () => { const s = new Set(); for (let i = 0; i < 10; i++) s.add(utility.randomNumber(4)); expect(s.size).toBeGreaterThan(1); });
});

const { constants } = require("../../../src/utils/constants");
describe("constants", () => {
  it("has admin", () => { expect(constants.admin.name).toBe("admin"); });
  it("has confirmEmails", () => { expect(constants.confirmEmails.from).toBe("no-reply@test-app.com"); });
});

jest.mock("nodemailer", () => {
  const sendMail = jest.fn();
  return { createTransport: jest.fn(() => ({ sendMail })) };
});
const nodemailer = require("nodemailer");
const mailer = require("../../../src/utils/mailer");
describe("mailer", () => {
  it("creates transport", () => { expect(nodemailer.createTransport).toHaveBeenCalled(); });
  it("send calls transport.sendMail", async () => {
    const transport = nodemailer.createTransport();
    transport.sendMail.mockResolvedValue({ messageId: "123" });
    await mailer.send("from@test.com", "to@test.com", "Test", "<p>Hello</p>");
    expect(transport.sendMail).toHaveBeenCalledWith({ from: "from@test.com", to: "to@test.com", subject: "Test", html: "<p>Hello</p>" });
  });
  it("propagates sendMail rejection", async () => {
    const transport = nodemailer.createTransport();
    transport.sendMail.mockRejectedValue(new Error("SMTP error"));
    await expect(mailer.send("a", "b", "c", "d")).rejects.toThrow("SMTP error");
  });
});
