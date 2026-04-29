const BookModel = require("../models/BookModel");

/**
 * Book data access layer.
 * Encapsulates all Mongoose operations for Book documents.
 */
class BookRepository {
	/**
	 * Find multiple books matching a query.
	 * @param {Object} query
	 * @param {string} [select] - Field selection string
	 * @returns {Promise<Array>}
	 */
	findMany(query, select) {
		return BookModel.find(query, select);
	}

	/**
	 * Find a single book matching a query.
	 * @param {Object} query
	 * @param {string} [select] - Field selection string
	 * @returns {Promise<Object|null>}
	 */
	findOne(query, select) {
		return BookModel.findOne(query, select);
	}

	/**
	 * Find a book by its ID.
	 * @param {string} id
	 * @returns {Promise<Object|null>}
	 */
	findById(id) {
		return BookModel.findById(id);
	}

	/**
	 * Find a book by ID and update.
	 * @param {string} id
	 * @param {Object} update
	 * @param {Object} [options]
	 * @returns {Promise}
	 */
	findByIdAndUpdate(id, update, options) {
		return BookModel.findByIdAndUpdate(id, update, options);
	}

	/**
	 * Find a book by ID and remove.
	 * @param {string} id
	 * @returns {Promise}
	 */
	findByIdAndRemove(id) {
		return BookModel.findByIdAndRemove(id);
	}

	/**
	 * Create and save a new book.
	 * @param {Object} bookData
	 * @returns {Promise<Object>} saved book document
	 */
	create(bookData) {
		const book = new BookModel(bookData);
		return book.save();
	}

	/**
	 * Delete documents matching query.
	 * @param {Object} query
	 * @returns {Promise}
	 */
	deleteMany(query) {
		return BookModel.deleteMany(query);
	}
}

module.exports = new BookRepository();
