/**
 * Unit tests for the AppError utility class.
 */
const AppError = require("../../../src/utils/AppError");

describe("AppError", () => {
  it("sets statusCode and isOperational", () => {
    const err = new AppError("Bad request", 400);
    expect(err.message).toBe("Bad request");
    expect(err.statusCode).toBe(400);
    expect(err.isOperational).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });

  it("status is fail for 4xx codes", () => {
    const err400 = new AppError("Bad", 400);
    expect(err400.status).toBe("fail");
    const err404 = new AppError("Missing", 404);
    expect(err404.status).toBe("fail");
  });

  it("status is error for 5xx codes", () => {
    const err = new AppError("Boom", 500);
    expect(err.status).toBe("error");
  });
});