/**
 * Async error wrapper for Express route handlers.
 * Catches rejected promises and forwards errors to the global error handler.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const catchAsync = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch((err) => {
			// If already an AppError, pass through; otherwise wrap in generic 500
			next(err);
		});
	};
};

module.exports = catchAsync;
