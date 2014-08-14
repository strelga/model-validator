"use strict";

var select = require('../lib/types/select');

var types = select.types;

describe('select', function () {
	describe('#validator', function () {
		it('should return NumberValidator if type is Number', function () {
			var validator = select.validator(Number);
			validator.should.be.instanceOf(types.NumberValidator);
		});

		it('should return BooleanValidator if type is Boolean', function () {
			var validator = select.validator(Boolean);
			validator.should.be.instanceOf(types.BooleanValidator);
		});

		it('should return StringValidator if type is String', function () {
			var validator = select.validator(String);
			validator.should.be.instanceOf(types.StringValidator);
		});

		it('should return DateValidator if type is Date', function () {
			var validator = select.validator(Date);
			validator.should.be.instanceOf(types.DateValidator);
		});

		it('should return ArrayValidator if type is Array', function () {
			var validator = select.validator([Number]);
			validator.should.be.instanceOf(types.ArrayValidator);
			validator.typeValidator.should.be.instanceOf(types.NumberValidator);
		});

		it('should throw if there is no such validator', function () {
			var selectValidator = function () {
				select.validator('hello');
			};

			selectValidator.should.throw;
		});
	});
})