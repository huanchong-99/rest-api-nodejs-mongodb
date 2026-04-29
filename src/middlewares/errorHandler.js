const apiResponse = require("../utils/apiResponse");

/**
 * Global error handling middleware — the last middleware in the stack.
 * Must be registered after all routes via app.use(errorHandler).
 *
 * Architecture Layer: Middleware
 * Handles every error thrown or forwarded via next(err):
 *   1. express-jwt UnauthorizedError -> 401
 *   2. AppError (operational) -> statusCode from the error
 *   3. Mongoose CastError (invalid ObjectId) -> 400
 *   4. Unknown/programming errors -> 500
 *
 * @see src/errors/AppError.js
 */
const errorHandler = (err, req, res, next) => {
	// Normalize Mongoose CastError (e.g. invalid ObjectId)
	if (err.name === "CastError") {
		err.statusCode = 400;
		err.isOperational = true;
		err.message = "Invalid " + err.kind + ": " + err.value;
	}

	// Handle express-jwt UnauthorizedError
	if (err.name === "UnauthorizedError") {
		return apiResponse.unauthorizedResponse(res, err.message);
	}

	// Handle operational errors (AppError + normalized Mongoose errors)
	if (err.isOperational) {
		const statusCode = err.statusCode || 500;

		if (statusCode === 401) {
			return apiResponse.unauthorizedResponse(res, err.message);
		}
		if (statusCode === 404) {
			return apiResponse.notFoundResponse(res, err.message);
		}
		if (statusCode === 400) {
			return apiResponse.validationErrorWithData(res, err.message, err.data || null);
		}
		return apiResponse.ErrorResponse(res, err.message);
	}

	// Programming or unknown errors - scrub internals
	console.error("Unexpected Error:", err);
	return apiResponse.ErrorResponse(res, "Internal Server Error");
};

module.exports = errorHandler;
