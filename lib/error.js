"use strict";

var util = require('util');

var ValidationError = module.exports = function (details) {
	Error.captureStackTrace(this, this.constructor);

	this.name = "ValidationError";
	this.message = JSON.stringify(details);
};

util.inherits(ValidationError, Error);