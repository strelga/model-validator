"use strict";

var util = require('util');

var Validator = require('../validator');

var NumberValidator = module.exports = function () {
	Validator.call(this);

	this.validators.type = assertType;
};

NumberValidator.prototype.assertType = function (value) {
	if (typeof value !== 'number') {
		return ' should be a number, (' + typeof value + ') ' + value + ' given instead.'
	}
};

util.inherits(NumberValidator, Validator);