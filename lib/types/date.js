"use strict";

var util = require('util');

var Validator = require('../validator');

var DateValidator = module.exports = function () {
	Validator.call(this);

	this.validators.type = this.assertType;
};

util.inherits(DateValidator, Validator);

DateValidator.prototype.assertType = function (value, path) {
	var ret = {};

	if (value instanceof Date) {
		ret.ok = true;
	} else {
		ret.ok = false;
		ret.msg = path + ' should be a date object, (' + typeof value + ') ' + value + ' is given instead.';
	}

	return ret;
};