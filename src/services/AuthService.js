const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserRepository = require("../repositories/UserRepository");
const AppError = require("../errors/AppError");
const utility = require("../utils/utility");
const mailer = require("../utils/mailer");
const { constants } = require("../utils/constants");

/**
 * Authentication business logic layer.
 * Handles registration, login, OTP verification, and password hashing.
 */
class AuthService {
	/**
	 * Register a new user.
	 * @param {string} firstName
	 * @param {string} lastName
	 * @param {string} email
	 * @param {string} password - Plain text password
	 * @returns {Promise<Object>} Created user data (no password)
	 */
	async register(firstName, lastName, email, password) {
		// Hash the password
		const hash = await bcrypt.hash(password, 10);

		// Generate OTP for email confirmation
		const otp = utility.randomNumber(4);

		// Build user data
		const userData = {
			firstName,
			lastName,
			email,
			password: hash,
			confirmOTP: otp
		};

		// Send confirmation email
		const html = "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
		try {
			await mailer.send(
				constants.confirmEmails.from,
				email,
				"Confirm Account",
				html
			);
		} catch (err) {
			throw new AppError("Failed to send confirmation email", 500);
		}

		// Save the user
		const user = await UserRepository.create(userData);

		return {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email
		};
	}

	/**
	 * Authenticate a user and return a JWT.
	 * @param {string} email
	 * @param {string} password - Plain text password
	 * @returns {Promise<Object>} User data with JWT token
	 */
	async login(email, password) {
		const user = await UserRepository.findByEmail(email);
		if (!user) {
			throw new AppError("Email or Password wrong.", 401);
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			throw new AppError("Email or Password wrong.", 401);
		}

		if (!user.isConfirmed) {
			throw new AppError("Account is not confirmed. Please confirm your account.", 401);
		}

		if (!user.status) {
			throw new AppError("Account is not active. Please contact admin.", 401);
		}

		const userData = {
			_id: user._id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email
		};

		// Prepare and sign JWT token
		const jwtPayload = userData;
		const jwtData = {
			expiresIn: process.env.JWT_TIMEOUT_DURATION
		};
		var signingKey = process.env.JWT_SECRET;
			userData.token = jwt.sign(jwtPayload, signingKey, jwtData);


		return userData;
	}

	/**
	 * Verify OTP to confirm a user account.
	 * @param {string} email
	 * @param {string} otp
	 * @returns {Promise<string>} Success message
	 */
	async verifyConfirm(email, otp) {
		const user = await UserRepository.findByEmail(email);
		if (!user) {
			throw new AppError("Specified email not found.", 401);
		}

		if (user.isConfirmed) {
			throw new AppError("Account already confirmed.", 401);
		}

		if (user.confirmOTP != otp) {
			throw new AppError("Otp does not match", 401);
		}

		await UserRepository.findOneAndUpdate({ email }, {
			isConfirmed: 1,
			confirmOTP: null
		});

		return "Account confirmed success.";
	}

	/**
	 * Resend confirmation OTP to user email.
	 * @param {string} email
	 * @returns {Promise<string>} Success message
	 */
	async resendConfirmOtp(email) {
		const user = await UserRepository.findByEmail(email);
		if (!user) {
			throw new AppError("Specified email not found.", 401);
		}

		if (user.isConfirmed) {
			throw new AppError("Account already confirmed.", 401);
		}

		// Generate new OTP
		const otp = utility.randomNumber(4);

		// Send confirmation email
		const html = "<p>Please Confirm your Account.</p><p>OTP: " + otp + "</p>";
		await mailer.send(
			constants.confirmEmails.from,
			email,
			"Confirm Account",
			html
		);

		// Update user with new OTP
		user.isConfirmed = 0;
		user.confirmOTP = otp;
		await UserRepository.save(user);

		return "Confirm otp sent.";
	}
}

module.exports = new AuthService();
