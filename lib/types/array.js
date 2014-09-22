"use strict";

var util = require('util');

var Validator = require('../validator');

var ArrayValidator = module.exports = function (dataType, select) {
	Validator.call(this);

	this.dataType = dataType;
	this.typeValidator = select.validator(dataType);

	this.validators.type = this.assertType;
};

util.inherits(ArrayValidator, Validator);

ArrayValidator.prototype.assertType = function (value) {
	var ret = {};

	if (value instanceof Array) {
		var result;
		for (var i = 0, l = value.length; i < l; i++) {
			result = this.typeValidator.assertType(value[i]);

			if (!result.ok) {
				ret.ok = false;
				ret.msg = 'In array element number ' + i + ': ' + result.msg;
				return ret;
			}
		}
		ret.ok = true;
		return ret;
	} else {
		ret.ok = false;
		ret.msg = 'Must be an array, (' + typeof value + ') ' + value + ' is given instead.';
		return ret;
	}
};

console.log(module.exports);