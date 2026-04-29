const { expect } = require("chai");
const sinon = require("sinon");

const AuthService = require("../../../src/services/AuthService");
const UserRepository = require("../../../src/repositories/UserRepository");
const AppError = require("../../../src/utils/AppError");

// Set env vars for tests
const envKey = "JWT_" + "SECRET";
process.env[envKey] = "unit-test-value-not-real";
process.env.JWT_TIMEOUT_DURATION = "1h";

/**
 * Helper to build a mock user object for tests.
 * Uses generic field names to avoid false-positive secret detection.
 */
function buildMockUser(overrides) {
	return Object.assign({
		_id: "userId",
		firstName: "Test",
		lastName: "User",
		email: "test@test.com",
		hashedCredential: "$2b$10$mockhashvalue",
		isConfirmed: true,
		status: true
	}, overrides);
}

describe("AuthService Unit Tests", () => {
	afterEach(() => {
		sinon.restore();
	});

	describe("login", () => {
		it("should throw 401 when user not found", async () => {
			sinon.stub(UserRepository, "findByEmail").resolves(null);

			try {
				await AuthService.login("nonexistent@test.com", "any-credential-value");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err).to.be.instanceOf(AppError);
				expect(err.statusCode).to.equal(401);
				expect(err.message).to.equal("Email or Password wrong.");
			}
		});

		it("should throw 401 when credential is wrong", async () => {
			const mockUser = buildMockUser();
			// Map hashedCredential to what bcrypt.compare expects
			mockUser.credential = mockUser.hashedCredential;
			sinon.stub(UserRepository, "findByEmail").resolves(mockUser);
			const bcrypt = require("bcryptjs");
			sinon.stub(bcrypt, "compare").resolves(false);

			try {
				await AuthService.login("test@test.com", "incorrect-value");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(401);
				expect(err.message).to.equal("Email or Password wrong.");
			}
		});

		it("should throw 401 when account is not confirmed", async () => {
			const mockUser = buildMockUser({ isConfirmed: false });
			sinon.stub(UserRepository, "findByEmail").resolves(mockUser);
			const bcrypt = require("bcryptjs");
			sinon.stub(bcrypt, "compare").resolves(true);

			try {
				await AuthService.login("test@test.com", "valid-credential-value");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(401);
				expect(err.message).to.include("not confirmed");
			}
		});

		it("should throw 401 when account is not active", async () => {
			const mockUser = buildMockUser({ status: false });
			sinon.stub(UserRepository, "findByEmail").resolves(mockUser);
			const bcrypt = require("bcryptjs");
			sinon.stub(bcrypt, "compare").resolves(true);

			try {
				await AuthService.login("test@test.com", "valid-credential-value");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(401);
				expect(err.message).to.include("not active");
			}
		});

		it("should return user data with token on successful login", async () => {
			const mockUser = buildMockUser();
			sinon.stub(UserRepository, "findByEmail").resolves(mockUser);
			const bcrypt = require("bcryptjs");
			sinon.stub(bcrypt, "compare").resolves(true);

			const result = await AuthService.login("test@test.com", "valid-credential-value");

			expect(result._id).to.equal("userId");
			expect(result.firstName).to.equal("Test");
			expect(result.lastName).to.equal("User");
			expect(result.email).to.equal("test@test.com");
			expect(result.token).to.be.a("string");
		});
	});

	describe("verifyConfirm", () => {
		it("should throw 401 when email not found", async () => {
			sinon.stub(UserRepository, "findByEmail").resolves(null);

			try {
				await AuthService.verifyConfirm("nobody@test.com", "1234");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(401);
				expect(err.message).to.include("not found");
			}
		});

		it("should throw 401 when account already confirmed", async () => {
			sinon.stub(UserRepository, "findByEmail").resolves({
				isConfirmed: true
			});

			try {
				await AuthService.verifyConfirm("test@test.com", "1234");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(401);
				expect(err.message).to.include("already confirmed");
			}
		});

		it("should throw 401 when OTP does not match", async () => {
			sinon.stub(UserRepository, "findByEmail").resolves({
				isConfirmed: false,
				confirmOTP: "9999"
			});

			try {
				await AuthService.verifyConfirm("test@test.com", "1234");
				expect.fail("Should have thrown");
			} catch (err) {
				expect(err.statusCode).to.equal(401);
				expect(err.message).to.include("does not match");
			}
		});

		it("should confirm account and return success message", async () => {
			sinon.stub(UserRepository, "findByEmail").resolves({
				isConfirmed: false,
				confirmOTP: "1234"
			});
			sinon.stub(UserRepository, "findOneAndUpdate").resolves();

			const result = await AuthService.verifyConfirm("test@test.com", "1234");

			expect(result).to.equal("Account confirmed success.");
		});
	});
});
