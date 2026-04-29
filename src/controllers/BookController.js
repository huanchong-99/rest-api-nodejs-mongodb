const BookService = require("../services/BookService");
const apiResponse = require("../utils/apiResponse");
const catchAsync = require("../utils/catchAsync");

/**
 * Book controller – handles HTTP request/response for book CRUD.
 * All business logic is delegated to BookService.
 */
exports.bookList = catchAsync(async (req, res) => {
	const books = await BookService.bookList(req.user._id);
	return apiResponse.successResponseWithData(res, "Operation success", books);
});

exports.bookDetail = catchAsync(async (req, res) => {
	const book = await BookService.bookDetail(req.params.id, req.user._id);
	return apiResponse.successResponseWithData(res, "Operation success", book);
});

exports.bookStore = catchAsync(async (req, res) => {
	const { title, description, isbn } = req.body;
	const book = await BookService.bookStore(title, description, isbn, req.user);
	return apiResponse.successResponseWithData(res, "Book add Success.", book);
});

exports.bookUpdate = catchAsync(async (req, res) => {
	const { title, description, isbn } = req.body;
	const book = await BookService.bookUpdate(req.params.id, title, description, isbn, req.user._id);
	return apiResponse.successResponseWithData(res, "Book update Success.", book);
});

exports.bookDelete = catchAsync(async (req, res) => {
	const message = await BookService.bookDelete(req.params.id, req.user._id);
	return apiResponse.successResponse(res, message);
});
