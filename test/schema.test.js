"use strict";

var Schema = require('../');

describe('Schema class', function () {
	var schema;

	beforeEach(function () {
		// schema = new Schema();
	});

	describe('#add', function () {
		it('should parse conditions and transform them to paths', function () {
			var schemaStub = {
				paths : {}
			};
			schemaStub.__proto__.add = Schema.prototype.add;
			
			var conditions = {
				field1 : { type : String, required : true },
				field2 : {
					field3 : { type : Boolean, required : false, default : true },
					field4 : { type : Number, required : true }
				}
			};

			Schema.prototype.add.call(schemaStub, conditions);

			// console.log(paths);

			schemaStub.paths['field1'].conditions.should.match({type : String, required : true});
			schemaStub.paths['field1'].pathArray.should.match(['field1']);
			schemaStub.paths['field2.field3'].conditions.should.match({type : Boolean, required : false, default : true});
			schemaStub.paths['field2.field3'].pathArray.should.match(['field2', 'field3']);
			schemaStub.paths['field2.field4'].conditions.should.match({type : Number, required : true});
			schemaStub.paths['field2.field4'].pathArray.should.match(['field2', 'field4']);
		});
	});
});