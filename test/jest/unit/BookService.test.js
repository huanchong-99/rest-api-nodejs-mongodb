jest.mock("../../../src/repositories/BookRepository");
jest.mock("mongoose", () => { const a = jest.requireActual("mongoose"); return { ...a, Types: { ObjectId: { isValid: jest.fn() } } }; });
const BookRepository = require("../../../src/repositories/BookRepository");
const mongoose = require("mongoose");
jest.isolateModules(() => {
  const BookService = require("../../../src/services/BookService");
  describe("BookService", () => {
    beforeEach(() => { jest.clearAllMocks(); });
    describe("bookList", () => {
      it("returns books", async () => { BookRepository.findMany.mockResolvedValue([{ _id: "b1", title: "B" }]); expect(await BookService.bookList("u1")).toHaveLength(1); });
      it("returns empty", async () => { BookRepository.findMany.mockResolvedValue([]); expect(await BookService.bookList("u1")).toEqual([]); });
    });
    describe("bookDetail", () => {
      it("empty for bad id", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(false); expect(await BookService.bookDetail("bad", "u1")).toEqual({}); });
      it("returns detail", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(true); BookRepository.findOne.mockResolvedValue({ _id: "b1", title: "T", description: "D", isbn: "I", createdAt: "2024" }); const r = await BookService.bookDetail("b1", "u1"); expect(r.id).toBe("b1"); });
      it("empty when not found", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(true); BookRepository.findOne.mockResolvedValue(null); expect(await BookService.bookDetail("b1", "u1")).toEqual({}); });
    });
    describe("bookStore", () => {
      it("creates book", async () => { BookRepository.create.mockResolvedValue({ _id: "b1", title: "T", description: "D", isbn: "I", createdAt: "2024" }); expect((await BookService.bookStore("T", "D", "I", { _id: "u1" })).id).toBe("b1"); });
    });
    describe("bookUpdate", () => {
      it("throws 400", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(false); try { await BookService.bookUpdate("bad","T","D","I","u1"); expect(true).toBe(false); } catch(e) { expect(e.statusCode).toBe(400); } });
      it("throws 404", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(true); BookRepository.findById.mockResolvedValue(null); try { await BookService.bookUpdate("b1","T","D","I","u1"); expect(true).toBe(false); } catch(e) { expect(e.statusCode).toBe(404); } });
      it("throws 401", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(true); BookRepository.findById.mockResolvedValue({ user: { toString: () => "other" } }); try { await BookService.bookUpdate("b1","T","D","I","u1"); expect(true).toBe(false); } catch(e) { expect(e.statusCode).toBe(401); } });
      it("updates", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(true); BookRepository.findById.mockResolvedValue({ user: { toString: () => "u1" }, createdAt: "2024" }); BookRepository.findByIdAndUpdate.mockResolvedValue({}); expect((await BookService.bookUpdate("b1","New","D","I","u1")).title).toBe("New"); });
    });
    describe("bookDelete", () => {
      it("throws 400", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(false); try { await BookService.bookDelete("bad","u1"); expect(true).toBe(false); } catch(e) { expect(e.statusCode).toBe(400); } });
      it("throws 404", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(true); BookRepository.findById.mockResolvedValue(null); try { await BookService.bookDelete("b1","u1"); expect(true).toBe(false); } catch(e) { expect(e.statusCode).toBe(404); } });
      it("throws 401", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(true); BookRepository.findById.mockResolvedValue({ user: { toString: () => "other" } }); try { await BookService.bookDelete("b1","u1"); expect(true).toBe(false); } catch(e) { expect(e.statusCode).toBe(401); } });
      it("deletes", async () => { mongoose.Types.ObjectId.isValid.mockReturnValue(true); BookRepository.findById.mockResolvedValue({ user: { toString: () => "u1" } }); BookRepository.findByIdAndRemove.mockResolvedValue({}); expect(await BookService.bookDelete("b1","u1")).toBe("Book delete Success."); });
    });
  });
});
