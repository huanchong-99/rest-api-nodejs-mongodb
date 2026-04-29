const UserModel = require("../models/UserModel");

/**
 * User data access layer.
 * Encapsulates all Mongoose operations for User documents.
 */
class UserRepository {
	/**
	 * Find a user by email address.
	 * @param {string} email
	 * @returns {Promise<Object|null>}
	 */
	findByEmail(email) {
		return UserModel.findOne({ email });
	}

	/**
	 * Find a user by arbitrary query.
	 * @param {Object} query
	 * @returns {Promise<Object|null>}
	 */
	findOne(query) {
		return UserModel.findOne(query);
	}

	/**
	 * Find a user by ID.
	 * @param {string} id
	 * @returns {Promise<Object|null>}
	 */
	findById(id) {
		return UserModel.findById(id);
	}

	/**
	 * Find a user and update.
	 * @param {Object} query  - Filter
	 * @param {Object} update - Update operations
	 * @returns {Promise}
	 */
	findOneAndUpdate(query, update) {
		return UserModel.findOneAndUpdate(query, update);
	}

	/**
	 * Create and save a new user.
	 * @param {Object} userData
	 * @returns {Promise<Object>} saved user document
	 */
	create(userData) {
		const user = new UserModel(userData);
		return user.save();
	}

	/**
	 * Save an existing user document.
	 * @param {Object} user - Mongoose user document
	 * @returns {Promise<Object>}
	 */
	save(user) {
		return user.save();
	}

	/**
	 * Delete documents matching query.
	 * @param {Object} query
	 * @returns {Promise}
	 */
	deleteMany(query) {
		return UserModel.deleteMany(query);
	}
}

module.exports = new UserRepository();
