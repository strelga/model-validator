"use strict";

var util = require('util');

var Validator = require('../validator');

var NumberValidator = module.exports = function () {
	Validator.call(this);

	this.validators.type = this.assertType;
};

util.inherits(NumberValidator, Validator);

NumberValidator.prototype.assertType = function (value) {
	var ret = {};

	if (typeof value === 'boolean') {
		ret.ok = true;
	} else {
		ret.ok = false;
		ret.msg = 'Must be a boolean, (' + typeof value + ') ' + value + ' is given instead.';
	}

	return ret;
};