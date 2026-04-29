var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");

var router = express.Router();

router.use("/auth/", authRouter);
router.use("/book/", bookRouter);

module.exports = router;
