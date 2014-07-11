"use strict";

var util = require('util');

var ValidationError = module.exports = function (msg, details) {
	Error.captureStackTrace(this, this.constructor);

	this.name = "ValidationError";
	this.message = msg || '';
	this.details = details || {};
};

util.inherits(ValidationError, Error);