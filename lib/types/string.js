"use strict";

var util = require('util');

var Validator = require('../validator');

var StringValidator = module.exports = function () {
	Validator.call(this);

	this.validators.type = this.assertType;
};

util.inherits(StringValidator, Validator);

StringValidator.prototype.assertType = function (value, path) {
	var ret = {};

	if (typeof value !== 'string') {
		ret.ok = false;
		ret.msg = path + ' should be a string, (' + typeof value + ') ' + value + ' is given instead.'
	} else {
		ret.ok = true;
	}

	return ret;
};