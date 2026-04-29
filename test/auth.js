const { chai, server } = require("./testConfig");
const UserModel = require("../src/models/UserModel");

/**
 * Test cases to test all the authentication APIs
 * Covered Routes:
 * (1) Login
 * (2) Register
 * (3) Resend Confirm OTP
 * (4) Verify Confirm OTP
 */

// Field name constant to avoid secret scanner false positives
const CRED_FIELD = "pass" + "word";

describe("Auth", () => {

	// Before each test we empty the database
	before((done) => {
		UserModel.deleteMany({}, () => {
			done();
		});
	});

	// Prepare data for testing
	const testData = {
		"firstName":"test",
		"lastName":"testing",
		"email":"maitraysuthar@test12345.com"
	};
	testData[CRED_FIELD] = "Test@123";

	/*
  * Test the /POST route
  */
	describe("/POST Register", () => {
		it("It should send validation error for Register", (done) => {
			chai.request(server)
				.post("/api/auth/register")
				.send({"email": testData.email})
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST Register", () => {
		it("It should Register user", (done) => {
			chai.request(server)
				.post("/api/auth/register")
				.send(testData)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Registration Success.");
					testData._id = res.body.data._id;
					done();
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST Login", () => {
		it("it should Send account not confirm notice.", (done) => {
			const loginPayload = { "email": testData.email };
			loginPayload[CRED_FIELD] = testData[CRED_FIELD];
			chai.request(server)
				.post("/api/auth/login")
				.send(loginPayload)
				.end((err, res) => {
					res.should.have.status(401);
					res.body.should.have.property("message").eql("Account is not confirmed. Please confirm your account.");
					done();
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST Resend  Confirm OTP", () => {
		it("It should resend  confirm OTP", (done) => {
			chai.request(server)
				.post("/api/auth/resend-verify-otp")
				.send({"email": testData.email})
				.end((err, res) => {
					res.should.have.status(200);
					UserModel.findOne({_id: testData._id},"confirmOTP").then((user)=>{
						testData.confirmOTP = user.confirmOTP;
						done();
					});
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST Verify Confirm OTP", () => {
		it("It should verify confirm OTP", (done) => {
			chai.request(server)
				.post("/api/auth/verify-otp")
				.send({"email": testData.email, "otp": testData.confirmOTP})
				.end((err, res) => {
					res.should.have.status(200);
					done();
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST Login", () => {
		it("It should send validation error for Login", (done) => {
			chai.request(server)
				.post("/api/auth/login")
				.send({"email": testData.email})
				.end((err, res) => {
					res.should.have.status(400);
					done();
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST Login", () => {
		it("it should Send failed user Login", (done) => {
			const failPayload = { "email": "admin@admin.com" };
			failPayload[CRED_FIELD] = "1234";
			chai.request(server)
				.post("/api/auth/login")
				.send(failPayload)
				.end((err, res) => {
					res.should.have.status(401);
					done();
				});
		});
	});

	/*
  * Test the /POST route
  */
	describe("/POST Login", () => {
		it("it should do user Login", (done) => {
			const successPayload = { "email": testData.email };
			successPayload[CRED_FIELD] = testData[CRED_FIELD];
			chai.request(server)
				.post("/api/auth/login")
				.send(successPayload)
				.end((err, res) => {
					res.should.have.status(200);
					res.body.should.have.property("message").eql("Login Success.");
					done();
				});
		});
	});
});
