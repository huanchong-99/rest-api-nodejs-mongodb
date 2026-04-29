var express = require("express");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");

const BookController = require("../controllers/BookController");
const BookRepository = require("../repositories/BookRepository");
const auth = require("../middlewares/auth");
const apiResponse = require("../utils/apiResponse");

var router = express.Router();

// All book routes require authentication
router.use(auth);

/**
 * Validation result handler middleware.
 */
const handleValidation = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
	}
	next();
};

// ---------- Validation chains ----------

const bookStoreValidation = [
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value, { req }) => {
		return BookRepository.findOne({ isbn: value, user: req.user._id }).then(book => {
			if (book) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
];

const bookUpdateValidation = [
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value, { req }) => {
		return BookRepository.findOne({ isbn: value, user: req.user._id, _id: { "$ne": req.params.id } }).then(book => {
			if (book) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
];

// ---------- Routes ----------

router.get("/", BookController.bookList);
router.get("/:id", BookController.bookDetail);
router.post("/", bookStoreValidation, handleValidation, BookController.bookStore);
router.put("/:id", bookUpdateValidation, handleValidation, BookController.bookUpdate);
router.delete("/:id", BookController.bookDelete);

module.exports = router;
