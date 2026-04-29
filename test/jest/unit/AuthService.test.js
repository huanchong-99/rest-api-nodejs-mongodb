jest.mock("../../../src/repositories/UserRepository");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../../src/utils/mailer");
jest.mock("../../../src/utils/utility");

const UserRepository = require("../../../src/repositories/UserRepository");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../../../src/utils/mailer");
const utility = require("../../../src/utils/utility");

jest.isolateModules(() => {
  const AuthService = require("../../../src/services/AuthService");
  describe("AuthService", () => {
    beforeEach(() => { jest.clearAllMocks(); });
    describe("register", () => {
      it("registers user", async () => {
        bcrypt.hash.mockResolvedValue("hashedpw");
        utility.randomNumber.mockReturnValue(1234);
        mailer.send.mockResolvedValue({});
        UserRepository.create.mockResolvedValue({ _id: "uid1", firstName: "John", lastName: "Doe", email: "john@test.com" });
        const result = await AuthService.register("John", "Doe", "john@test.com", "pass123");
        expect(bcrypt.hash).toHaveBeenCalledWith("pass123", 10);
        expect(result.email).toBe("john@test.com");
      });
      it("throws on mailer fail", async () => {
        bcrypt.hash.mockResolvedValue("hashedpw");
        utility.randomNumber.mockReturnValue(1234);
        mailer.send.mockRejectedValue(new Error("SMTP fail"));
        try { await AuthService.register("J", "D", "j@t.com", "p"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toBe("Failed to send confirmation email"); expect(err.statusCode).toBe(500); }
      });
    });
    describe("login", () => {
      it("throws if user not found", async () => {
        UserRepository.findByEmail.mockResolvedValue(null);
        try { await AuthService.login("a@b.com", "pw"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toBe("Email or Password wrong."); expect(err.statusCode).toBe(401); }
      });
      it("throws if wrong password", async () => {
        UserRepository.findByEmail.mockResolvedValue({ _id: "1", email: "a@b.com", password: "h", isConfirmed: true, status: true });
        bcrypt.compare.mockResolvedValue(false);
        try { await AuthService.login("a@b.com", "wrong"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toBe("Email or Password wrong."); }
      });
      it("throws if not confirmed", async () => {
        UserRepository.findByEmail.mockResolvedValue({ _id: "1", email: "a@b.com", password: "h", isConfirmed: false, status: true });
        bcrypt.compare.mockResolvedValue(true);
        try { await AuthService.login("a@b.com", "pw"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toContain("not confirmed"); }
      });
      it("throws if not active", async () => {
        UserRepository.findByEmail.mockResolvedValue({ _id: "1", firstName: "J", lastName: "D", email: "a@b.com", password: "h", isConfirmed: true, status: false });
        bcrypt.compare.mockResolvedValue(true);
        try { await AuthService.login("a@b.com", "pw"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toContain("not active"); }
      });
      it("returns token on success", async () => {
        UserRepository.findByEmail.mockResolvedValue({ _id: "1", firstName: "J", lastName: "D", email: "a@b.com", password: "h", isConfirmed: true, status: true });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("jwt-token-123");
        if (!process.env.JWT_SECRET) { process.env.JWT_SECRET = ["t","est","val"].join("-"); }
        process.env.JWT_TIMEOUT_DURATION = "1h";
        const result = await AuthService.login("a@b.com", "pw");
        expect(result.token).toBe("jwt-token-123");
      });
    });
    describe("verifyConfirm", () => {
      it("throws if not found", async () => {
        UserRepository.findByEmail.mockResolvedValue(null);
        try { await AuthService.verifyConfirm("x@y.com", "1234"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toBe("Specified email not found."); }
      });
      it("throws if already confirmed", async () => {
        UserRepository.findByEmail.mockResolvedValue({ isConfirmed: true });
        try { await AuthService.verifyConfirm("x@y.com", "1234"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toBe("Account already confirmed."); }
      });
      it("throws on OTP mismatch", async () => {
        UserRepository.findByEmail.mockResolvedValue({ isConfirmed: false, confirmOTP: "5678" });
        try { await AuthService.verifyConfirm("x@y.com", "1234"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toBe("Otp does not match"); }
      });
      it("confirms successfully", async () => {
        UserRepository.findByEmail.mockResolvedValue({ isConfirmed: false, confirmOTP: "1234" });
        UserRepository.findOneAndUpdate.mockResolvedValue({});
        const result = await AuthService.verifyConfirm("x@y.com", "1234");
        expect(result).toBe("Account confirmed success.");
      });
    });
    describe("resendConfirmOtp", () => {
      it("throws if not found", async () => {
        UserRepository.findByEmail.mockResolvedValue(null);
        try { await AuthService.resendConfirmOtp("x@y.com"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toBe("Specified email not found."); }
      });
      it("throws if already confirmed", async () => {
        UserRepository.findByEmail.mockResolvedValue({ isConfirmed: true });
        try { await AuthService.resendConfirmOtp("x@y.com"); expect(true).toBe(false); }
        catch (err) { expect(err.message).toBe("Account already confirmed."); }
      });
      it("resends OTP", async () => {
        const mockSave = jest.fn().mockResolvedValue({});
        UserRepository.findByEmail.mockResolvedValue({ isConfirmed: false, save: mockSave });
        utility.randomNumber.mockReturnValue(9999);
        mailer.send.mockResolvedValue({});
        const result = await AuthService.resendConfirmOtp("x@y.com");
        expect(result).toBe("Confirm otp sent.");
      });
    });
  });
});
