const jwt = require("express-jwt");

/**
 * JWT authentication middleware.
 * Validates the Authorization header Bearer token.
 */
var jwtOptions = {};
jwtOptions['secret'] = process.env.JWT_SECRET;

const authenticate = jwt(jwtOptions);

module.exports = authenticate;
