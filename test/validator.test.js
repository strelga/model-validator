"use strict";

var Validator = require('../lib/validator');

describe('Validator', function () {
	var validator;

	beforeEach(function () {
		validator = new Validator();
	});

	describe('#getAssert and #assert', function () {
		var assertLessThan;
		var assertGreaterThan;

		before(function () {
			assertLessThan = function (number) {
				return function (element) {
					if (element < number) {
						return;
					} else {
						var errMsg = '%s should be less than ' + number + '. ' +
							element + ' given.';
						return errMsg;
					}
				}
			};
			assertGreaterThan = function (number) {
				return function (element) {
					if (element > number) {
						return;
					} else {
						var errMsg = '%s should be greater than ' + number + '. ' +
							element + ' given.';
						return errMsg;
					}	
				}
			};
		});

		it('getAssert should return function', function () {
			var assert = validator.getAssert([function (element) {}]);

			assert.should.be.type('function');
		});

		it('assert should return err msg if at least one of functions passed to it returned err msg', function () {
			var func1 = assertGreaterThan(5);
			var func2 = assertLessThan(10);

			var assert = validator.getAssert([func1, func2]);

			var errMsg = assert(1);

			errMsg.should.be.type('string');
		});

		it('assert should return undefined if all conditions in functions are satisfied', function () {
			var func1 = assertGreaterThan(5);
			var func2 = assertLessThan(10);

			var assert = validator.getAssert([func1, func2]);

			var errMsg = assert(6);

			(errMsg === undefined).should.be.ok;
		});
	});
});