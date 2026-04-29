const AuthService = require("../services/AuthService");
const apiResponse = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

/**
 * Auth controller – handles HTTP request/response for authentication.
 * All business logic is delegated to AuthService.
 */
exports.register = catchAsync(async (req, res) => {
	const { firstName, lastName, email, password } = req.body;
	const userData = await AuthService.register(firstName, lastName, email, password);
	return apiResponse.successResponseWithData(res, "Registration Success.", userData);
});

exports.login = catchAsync(async (req, res) => {
	const { email, password } = req.body;
	const userData = await AuthService.login(email, password);
	return apiResponse.successResponseWithData(res, "Login Success.", userData);
});

exports.verifyConfirm = catchAsync(async (req, res) => {
	const { email, otp } = req.body;
	const message = await AuthService.verifyConfirm(email, otp);
	return apiResponse.successResponse(res, message);
});

exports.resendConfirmOtp = catchAsync(async (req, res) => {
	const { email } = req.body;
	const message = await AuthService.resendConfirmOtp(email);
	return apiResponse.successResponse(res, message);
});
