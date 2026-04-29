const nodemailer = require("nodemailer");

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP_HOST,
	port: process.env.EMAIL_SMTP_PORT,
	auth: {
		user: process.env.EMAIL_SMTP_USERNAME,
		pass: process.env.EMAIL_SMTP_PASSWORD
	}
});

/**
 * Send an email.
 * @param {string} from    - Sender address
 * @param {string} to      - Recipient address
 * @param {string} subject - Email subject
 * @param {string} html    - HTML body
 * @returns {Promise}
 */
exports.send = function (from, to, subject, html) {
	return transporter.sendMail({
		from: from,
		to: to,
		subject: subject,
		html: html
	});
};
