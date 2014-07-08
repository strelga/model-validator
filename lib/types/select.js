"use strict";

var mongoose = require('mongoose');

var types = {};

types.NumberValidator = require('./number');
types.BooleanValidator = require('./boolean');
types.DateValidator = require('./date');
types.StringValidator = require('./string');

module.exports.validator = function (type) {
	var ret;
	var arrayOf;

	if (Array.isArray(type)) {
		arrayOf = type[0];
		type = Array;
	}

	switch (type) {
		case Number:
			ret = new types.NumberValidator();
			break;
		case Boolean:
			ret = new types.BooleanValidator();
			break;
		case Date:
			ret = new types.DateValidator();
			break;
		case String:
			ret = new types.StringValidator();
			break;
		case Array:
		case mongoose.Schema.Types.Mixed:
		default:
			throw new Error('Validations for this type are not supported: ' + type + '.');
	}

	return ret;
};

module.exports.types = types;