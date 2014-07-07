"use strict";

var util = require('util');

var Validator = require('../validator');

var StringValidator = module.exports = function () {
	Validator.call(this);

	this.validators.type = assertType;
};

StringValidator.prototype.assertType = function (value) {
	if (typeof value !== 'string') {
		return ' should be a string, (' + typeof value + ') ' + value + ' given instead.'
	}
};

util.inherits(StringValidator, Validator);