var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();

var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api");
var errorHandler = require("./middlewares/errorHandler");
var apiResponse = require("./utils/apiResponse");
var cors = require("cors");

// DB connection
var connectDB = require("./config/db");
connectDB();

var app = express();

// Don't show the log when it is test
if (process.env.NODE_ENV !== "test") {
	app.use(logger("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Allow cross-origin requests
app.use(cors());

// Route Prefixes
app.use("/", indexRouter);
app.use("/api/", apiRouter);

// Throw 404 if URL not found — forward to error handler
app.use(function(req, res, next) {
	var err = new Error("Page not found");
	err.statusCode = 404;
	err.isOperational = true;
	next(err);
});

// Global error handler (must be last middleware)
app.use(errorHandler);

module.exports = app;
