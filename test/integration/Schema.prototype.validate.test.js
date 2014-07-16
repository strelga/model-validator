"use strict";

var Schema = require('../../');
var should = require('should');

describe('Schema.prototype.validate', function () {
	describe('plain schema', function () {
		var schema;

		beforeEach(function () {
			schema = new Schema({
				userId : {type : String, required : true},
				status : {type : Number},
				createdAt : {type : Date, required : true},
				syncId : {type : String, required : true, default : ''},
				orderId : {type : String, required : true, default : '123'}
			}, {throws : true});
		});

		it('should throw away useless fields and substitute defaults', function () {
			var obj = schema.validate({
				userId : '1',
				status : 3,
				createdAt : new Date(),
				orderId : '1234',
				myId : 'hello'
			});

			// console.log(obj);
			obj.userId.should.match('1');
			obj.status.should.be.equal(3);
			obj.createdAt.should.be.instanceOf(Date);
			obj.syncId.should.match('');
			obj.orderId.should.match('1234');
			(obj.myId === undefined).should.be.ok;
		});

		it('should throw if some conditions are unmet', function () {
			var obj;

			(function () {
				obj = schema.validate({
					createdAt : new Date(),
					orderId : '135'
				});
			}).should.throw();
		});
	});

	describe('mixed schema', function () {
		var schema;

		beforeEach(function () {
			schema = new Schema({
				attrs : {type : 'mixed', mixed : {
						votes : {
							user1 : {
								voteType : {type : Number, required : true}
							},
							user2 : {
								voteType : {type : Number, required : true}
							}
						},
						connections : {
							status : {type : Number, required : true}
						}
					}
				},
				proxType : {type : Number, required : true, default : 1}	
			});
		});

		it('should validate', function () {
			var obj = schema.validate({
				
			});
		});
	});
});