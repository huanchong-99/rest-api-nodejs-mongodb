var express = require("express");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");

const AuthController = require("../controllers/AuthController");
const UserRepository = require("../repositories/UserRepository");
const apiResponse = require("../utils/apiResponse");

var router = express.Router();

/**
 * Validation result handler middleware.
 * Returns 400 if validation fails; otherwise calls next().
 */
const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
	}
	next();
};

// ---------- Validation chains ----------

const registerValidation = [
	body("firstName").isLength({ min: 1 }).trim().withMessage("First name must be specified.")
		.isAlphanumeric().withMessage("First name has non-alphanumeric characters."),
	body("lastName").isLength({ min: 1 }).trim().withMessage("Last name must be specified.")
		.isAlphanumeric().withMessage("Last name has non-alphanumeric characters."),
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return UserRepository.findByEmail(value).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	sanitizeBody("firstName").escape(),
	sanitizeBody("lastName").escape(),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
];

const loginValidation = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("password").isLength({ min: 1 }).trim().withMessage("Password must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("password").escape(),
];

const verifyOtpValidation = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	body("otp").isLength({ min: 1 }).trim().withMessage("OTP must be specified."),
	sanitizeBody("email").escape(),
	sanitizeBody("otp").escape(),
];

const resendOtpValidation = [
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address."),
	sanitizeBody("email").escape(),
];

// ---------- Routes ----------

router.post("/register", registerValidation, handleValidation, AuthController.register);
router.post("/login", loginValidation, handleValidation, AuthController.login);
router.post("/verify-otp", verifyOtpValidation, handleValidation, AuthController.verifyConfirm);
router.post("/resend-verify-otp", resendOtpValidation, handleValidation, AuthController.resendConfirmOtp);

module.exports = router;
