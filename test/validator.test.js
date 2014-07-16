"use strict";

var sinon = require('sinon');

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
				return function (element, path) {
					var ret = {};
					if (element < number) {
						ret.ok = true;
					} else {
						ret.ok = false;
						ret.msg = path + ' should be less than ' + number + '. ' +
							element + ' given.';
					}
					return ret;
				}
			};
			assertGreaterThan = function (number) {
				return function (element, path) {
					var ret = {};
					if (element > number) {
						ret.ok = true;
					} else {
						ret.ok = false;
						ret.msg = path + ' should be greater than ' + number + '. ' +
							element + ' given.';
					}
					return ret;
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

			var res = assert(1);

			res.msg.should.be.type('string');
			res.ok.should.not.be.ok;
		});

		it('assert should return undefined if all conditions in functions are satisfied', function () {
			var func1 = assertGreaterThan(5);
			var func2 = assertLessThan(10);

			var assert = validator.getAssert([func1, func2]);

			var res = assert(6);

			res.ok.should.be.ok;
		});
	});

	// describe('#assertRequired', function () {
	// 	it('should return ok=true if the value is present', function () {
	// 		var res = validator.assertRequired(5);

	// 		res.ok.should.be.ok;
	// 	});

	// 	it('should return ok=false and msg if there is no value', function () {
	// 		var res = validator.assertRequired(undefined);

	// 		res.ok.should.not.be.ok;
	// 		res.msg.should.be.type('string');
	// 	});
	// });

	describe('#getFullValueValidator', function () {
		beforeEach(function () {
			validator.validators.type = sinon.stub();
			validator.validators.type.returns({ok : true});
			validator.validators.required = sinon.stub();
			validator.validators.required.returns({ok : true});
		});

		it('should call validators.type function', function () {
			var assertValue = validator.getFullValueValidator({});
			var res = assertValue(5);

			validator.validators.type.withArgs(5).calledOnce.should.be.ok;
			res.ok.should.be.ok;
		});

		it('should call functions specified in arguments', function () {
			var assertValue = validator.getFullValueValidator({required : true});
			var res = assertValue(5);

			validator.validators.type.withArgs(5).calledOnce.should.be.ok;
			validator.validators.required.withArgs(5).calledOnce.should.be.ok;
			res.ok.should.be.ok;
		});

		it('should throw if one of specified conditions is not in validators hash', function () {
			var func = function () {
				var assertValue = validator.getFullValueValidator({required : true, wrongKey : true});
			}
			func.should.throw();
		});
	});
});