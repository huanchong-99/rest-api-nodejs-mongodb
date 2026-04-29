/**
 * @module src/errors/AppError
 * Custom operational error class for unified error handling.
 *
 * Architecture Layer: Errors
 * Dependency flow: Routes > Controllers > Services > Repositories > Models
 *
 * Extends the native Error class with HTTP-aware properties so that
 * the global error handler (src/middlewares/errorHandler.js) can
 * produce consistent JSON responses automatically.
 *
 * Properties:
 *   - statusCode    {number}   HTTP status code (400, 401, 404, 500, etc.)
 *   - status        {string}   'fail' for 4xx, 'error' for 5xx
 *   - isOperational {boolean}  true — signals the global error handler
 *                              to format a client-safe response
 *   - data          {*}        Optional payload (e.g. validation error array)
 */
class AppError extends Error {
  /**
   * Create an operational error.
   * @param {string} message    - Human-readable error message
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 404, 500)
   * @param {*}      [data]     - Optional additional payload
   */
  constructor(message, statusCode, data) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    if (data !== undefined) {
      this.data = data;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;


