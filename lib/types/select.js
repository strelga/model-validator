"use strict";

var mongoose = require('mongoose');

var select = {};

select.types = {};

select.types.NumberValidator = require('./number');
select.types.BooleanValidator = require('./boolean');
select.types.DateValidator = require('./date');
select.types.StringValidator = require('./string');
select.types.ArrayValidator = require('./array');

select.validator = function (type) {
	var ret;
	var arrayOf;

	if (Array.isArray(type)) {
		arrayOf = type[0];
		type = Array;
	}

	switch (type) {
		case Number:
			ret = new select.types.NumberValidator();
			break;
		case Boolean:
			ret = new select.types.BooleanValidator();
			break;
		case Date:
			ret = new select.types.DateValidator();
			break;
		case String:
			ret = new select.types.StringValidator();
			break;
		case Array:
			ret = new select.types.ArrayValidator(arrayOf, select);
			break;
		case mongoose.Schema.Types.Mixed:
		default:
			throw new Error('Validations for this type are not supported: ' + type + '.');
	}

	return ret;
};

module.exports = select;