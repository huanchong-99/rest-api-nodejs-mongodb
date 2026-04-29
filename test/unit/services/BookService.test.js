const { expect } = require("chai");
const sinon = require("sinon");

const BookService = require("../../../src/services/BookService");
const BookRepository = require("../../../src/repositories/BookRepository");

describe("BookService Unit Tests", () => {
	let repoStub;

	afterEach(() => {
		sinon.restore();
	});

	describe("bookList", () => {
		it("should return books for a given user", async () => {
			const mockBooks = [
				{ _id: "1", title: "Book 1", description: "Desc 1", isbn: "123", createdAt: new Date() },
				{ _id: "2", title: "Book 2", description: "Desc 2", isbn: "456", createdAt: new Date() }
			];
			repoStub = sinon.stub(BookRepository, "findMany").resolves(mockBooks);

			const result = await BookService.bookList("userId123");

			expect(result).to.deep.equal(mockBooks);
			expect(repoStub.calledOnceWith(
				{ user: "userId123" },
				"_id title description isbn createdAt"
			)).to.be.true;
		});

		it("should return empty array when no books found", async () => {
			repoStub = sinon.stub(BookRepository, "findMany").resolves([]);

			const result = await BookService.bookList("userId123");

			expect(result).to.deep.equal([]);
		});
	});

	describe("bookDetail", () => {
		it("should return empty object for invalid ObjectId", async () => {
			const result = await BookService.bookDetail("invalid-id", "userId");

			expect(result).to.deep.equal({});
		});

		it("should return book data for valid book", async () => {
			const mockBook = {
				_id: "507f1f77bcf86cd799439011",
				title: "Test Book",
				description: "Desc",
				isbn: "123",
				createdAt: new Date("2024-01-01")
			};
			repoStub = sinon.stub(BookRepository, "findOne").resolves(mockBook);

			const result = await BookService.bookDetail("507f1f77bcf86cd799439011", "userId");

			expect(result.id).to.equal("507f1f77bcf86cd799439011");
			expect(result.title).to.equal("Test Book");
		});

		it("should return empty object when book not found", async () => {
			repoStub = sinon.stub(BookRepository, "findOne").resolves(null);

			const result = await BookService.bookDetail("507f1f77bcf86cd799439011", "userId");

			expect(result).to.deep.equal({});
		});
	});

	describe("bookStore", () => {
		it("should create a book and return formatted data", async () => {
			const savedBook = {
				_id: "507f1f77bcf86cd799439011",
				title: "New Book",
				description: "New Desc",
				isbn: "789",
				createdAt: new Date("2024-01-01")
			};
			repoStub = sinon.stub(BookRepository, "create").resolves(savedBook);

			const result = await BookService.bookStore("New Book", "New Desc", "789", { _id: "userId" });

			expect(result.id).to.equal("507f1f77bcf86cd799439011");
			expect(result.title).to.equal("New Book");
			expect(repoStub.calledOnce).to.be.true;
		});
	});

	describe("bookUpdate", () => {
		it("should throw AppError for invalid ID", async () => {
			try {
				await BookService.bookUpdate("invalid", "title", "desc", "isbn", "userId");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(400);
				expect(err.message).to.equal("Invalid ID");
			}
		});

		it("should throw 404 when book not found", async () => {
			repoStub = sinon.stub(BookRepository, "findById").resolves(null);

			try {
				await BookService.bookUpdate("507f1f77bcf86cd799439011", "title", "desc", "isbn", "userId");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(404);
			}
		});

		it("should throw 401 when user is not authorized", async () => {
			repoStub = sinon.stub(BookRepository, "findById").resolves({
				user: { toString: () => "differentUserId" }
			});

			try {
				await BookService.bookUpdate("507f1f77bcf86cd799439011", "title", "desc", "isbn", "userId");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(401);
			}
		});

		it("should update and return book data", async () => {
			const foundBook = {
				user: { toString: () => "userId" },
				createdAt: new Date("2024-01-01")
			};
			sinon.stub(BookRepository, "findById").resolves(foundBook);
			sinon.stub(BookRepository, "findByIdAndUpdate").resolves();

			const result = await BookService.bookUpdate("507f1f77bcf86cd799439011", "Updated", "Desc", "ISBN", "userId");

			expect(result.title).to.equal("Updated");
			expect(result.isbn).to.equal("ISBN");
		});
	});

	describe("bookDelete", () => {
		it("should throw AppError for invalid ID", async () => {
			try {
				await BookService.bookDelete("invalid", "userId");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(400);
			}
		});

		it("should delete book and return success message", async () => {
			sinon.stub(BookRepository, "findById").resolves({
				user: { toString: () => "userId" }
			});
			sinon.stub(BookRepository, "findByIdAndRemove").resolves();

			const result = await BookService.bookDelete("507f1f77bcf86cd799439011", "userId");

			expect(result).to.equal("Book delete Success.");
		});
	});
});
