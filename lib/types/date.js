"use strict";

var util = require('util');

var Validator = require('../validator');

var DateValidator = module.exports = function () {
	Validator.call(this);

	this.validators.type = assertType;
};

DateValidator.prototype.assertType = function (value) {
	if (!((typeof value === 'object') && (value instanceof Date))) {
		return ' should be a date object, (' + typeof value + ') ' + value + ' given instead.'
	}
};

util.inherits(DateValidator, Validator);