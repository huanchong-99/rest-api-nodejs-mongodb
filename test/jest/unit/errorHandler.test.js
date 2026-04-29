/**
 * Unit tests for the global error handler middleware.
 * Covers: UnauthorizedError, AppError (400/401/404/500), unknown errors.
 */
const errorHandler = require("../../../src/middlewares/errorHandler");
const AppError = require("../../../src/utils/AppError");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe("errorHandler middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = mockRes();
    next = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("handles express-jwt UnauthorizedError", () => {
    const err = new Error("jwt malformed");
    err.name = "UnauthorizedError";
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 0 }));
  });

  it("handles AppError with 401 statusCode", () => {
    const err = new AppError("Unauthorized access", 401);
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Unauthorized access" }));
  });

  it("handles AppError with 404 statusCode", () => {
    const err = new AppError("Not found", 404);
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Not found" }));
  });

  it("handles AppError with 400 statusCode and data", () => {
    const err = new AppError("Validation failed", 400);
    err.data = [{ field: "email", message: "Invalid" }];
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Array) }));
  });

  it("handles AppError with 500 statusCode (generic server error)", () => {
    const err = new AppError("Something went wrong", 500);
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Something went wrong" }));
  });

  it("handles unknown non-operational errors", () => {
    const err = new Error("Unexpected crash");
    errorHandler(err, req, res, next);
    expect(console.error).toHaveBeenCalledWith("Unexpected Error:", err);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Internal Server Error" }));
  });

  it("handles Mongoose CastError by normalizing to 400", () => {
    const err = new Error("Cast to ObjectId failed");
    err.name = "CastError";
    err.kind = "ObjectId";
    err.value = "invalid-id";
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Invalid ObjectId: invalid-id"
    }));
  });

  it("handles Mongoose ValidationError by normalizing to 400", () => {
    const err = new Error("Validation failed");
    err.name = "ValidationError";
    err.errors = {
      title: { message: "Title is required" },
      isbn: { message: "ISBN is required" }
    };
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: "Title is required; ISBN is required"
    }));
  });
});