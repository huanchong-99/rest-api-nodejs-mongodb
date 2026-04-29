var mongoose = require("mongoose");

const BookRepository = require("../repositories/BookRepository");
const AppError = require("../errors/AppError");

/**
 * Book business logic layer.
 * Handles authorization checks and data transformation for book operations.
 */
class BookService {
	/**
	 * List all books belonging to a user.
	 * @param {string} userId
	 * @returns {Promise<Array>} Book list
	 */
	async bookList(userId) {
		const books = await BookRepository.findMany(
			{ user: userId },
			"_id title description isbn createdAt"
		);
		return books.length > 0 ? books : [];
	}

	/**
	 * Get detail of a single book.
	 * @param {string} bookId
	 * @param {string} userId
	 * @returns {Promise<Object>} Book data or empty object
	 */
	async bookDetail(bookId, userId) {
		if (!mongoose.Types.ObjectId.isValid(bookId)) {
			return {};
		}

		const book = await BookRepository.findOne(
			{ _id: bookId, user: userId },
			"_id title description isbn createdAt"
		);

		if (book !== null) {
			return {
				id: book._id,
				title: book.title,
				description: book.description,
				isbn: book.isbn,
				createdAt: book.createdAt
			};
		} else {
			return {};
		}
	}

	/**
	 * Create a new book.
	 * @param {string} title
	 * @param {string} description
	 * @param {string} isbn
	 * @param {Object} user - The authenticated user object
	 * @returns {Promise<Object>} Created book data
	 */
	async bookStore(title, description, isbn, user) {
		const bookData = {
			title,
			description,
			isbn,
			user: user
		};

		const book = await BookRepository.create(bookData);

		return {
			id: book._id,
			title: book.title,
			description: book.description,
			isbn: book.isbn,
			createdAt: book.createdAt
		};
	}

	/**
	 * Update an existing book.
	 * @param {string} bookId
	 * @param {string} title
	 * @param {string} description
	 * @param {string} isbn
	 * @param {string} userId
	 * @returns {Promise<Object>} Updated book data
	 */
	async bookUpdate(bookId, title, description, isbn, userId) {
		if (!mongoose.Types.ObjectId.isValid(bookId)) {
			throw new AppError("Invalid ID", 400);
		}

		const foundBook = await BookRepository.findById(bookId);
		if (foundBook === null) {
			throw new AppError("Book not exists with this id", 404);
		}

		// Check authorized user
		if (foundBook.user.toString() !== userId) {
			throw new AppError("You are not authorized to do this operation.", 401);
		}

		// Update book
		const updateData = {
			title,
			description,
			isbn,
			_id: bookId
		};

		await BookRepository.findByIdAndUpdate(bookId, updateData, {});

		return {
			id: updateData._id,
			title: updateData.title,
			description: updateData.description,
			isbn: updateData.isbn,
			createdAt: foundBook.createdAt
		};
	}

	/**
	 * Delete a book.
	 * @param {string} bookId
	 * @param {string} userId
	 * @returns {Promise<string>} Success message
	 */
	async bookDelete(bookId, userId) {
		if (!mongoose.Types.ObjectId.isValid(bookId)) {
			throw new AppError("Invalid ID", 400);
		}

		const foundBook = await BookRepository.findById(bookId);
		if (foundBook === null) {
			throw new AppError("Book not exists with this id", 404);
		}

		// Check authorized user
		if (foundBook.user.toString() !== userId) {
			throw new AppError("You are not authorized to do this operation.", 401);
		}

		await BookRepository.findByIdAndRemove(bookId);

		return "Book delete Success.";
	}
}

module.exports = new BookService();
