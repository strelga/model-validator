"use strict";

var ArrayValidator = require('../lib/types/array');
var select = require('../lib/types/select');

describe('ArrayValidator', function () {
	describe('#assertType', function () {
		it('should assert array of Numbers', function () {
			var arrayValidator = new ArrayValidator(Number, select);

			var arr = [1, 2, 3];

			var result = arrayValidator.assertType(arr);

			result.ok.should.be.ok;
		});

		it('shiuld assert defective array of Numbers', function () {
			var arrayValidator = new ArrayValidator(Number, select);

			var arr = [1, 2, true];

			var result = arrayValidator.assertType(arr);

			result.ok.should.not.be.ok;
			result.msg.should.be.type('string');
		});
	});
});