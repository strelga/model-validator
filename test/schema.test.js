"use strict";

var util = require('util');

var Schema = require('../');

describe('Schema class', function () {
	describe('#add', function () {
		var schemaStub;

		beforeEach(function () {
			var SchemaStub = function () {
				this.pathsInit = {};
				this.hasMixed = false;
				this.mixedPathsInit = {};
			};

			SchemaStub.prototype.add = Schema.prototype.add;

			schemaStub = new SchemaStub();
		});

		it('should parse conditions and transform them to pathsInit', function () {
			var conditions = {
				field1 : { type : String, required : true },
				field2 : {
					field3 : { type : Boolean, required : false, default : true },
					field4 : { type : Number, required : true }
				}
			};

			Schema.prototype.add.call(schemaStub, conditions);

			// console.log(schemaStub.pathsInit);

			schemaStub.pathsInit['field1'].conditions.should.match({type : String, required : true});
			schemaStub.pathsInit['field1'].pathArray.should.match(['field1']);
			schemaStub.pathsInit['field2.field3'].conditions.should.match({type : Boolean, required : false, default : true});
			schemaStub.pathsInit['field2.field3'].pathArray.should.match(['field2', 'field3']);
			schemaStub.pathsInit['field2.field4'].conditions.should.match({type : Number, required : true});
			schemaStub.pathsInit['field2.field4'].pathArray.should.match(['field2', 'field4']);
		});

		it('should parse conditions for mixed fields', function () {
			var conditions = {
				field1 : {
					field2 : { 
						type : 'mixed', mixed : {
							votes : { 
								cntId : {type : String, required : true},
								cntType : {type : Number, required : true}
							},
							connections : {
								connId : {type : String, required : true}
							}	
						}
					}
				}
			};

			Schema.prototype.add.call(schemaStub, conditions);

			// console.log(util.inspect(schemaStub.mixedPathsInit, {depth : null}));

			schemaStub.mixedPathsInit['field1.field2.votes']['field1.field2.cntId'].conditions.should.match({type : String, required : true});
			schemaStub.mixedPathsInit['field1.field2.votes']['field1.field2.cntId'].pathArray.should.match(['field1', 'field2', 'cntId']);
			schemaStub.mixedPathsInit['field1.field2.votes']['field1.field2.cntType'].conditions.should.match({type : Number, required : true});
			schemaStub.mixedPathsInit['field1.field2.votes']['field1.field2.cntType'].pathArray.should.match(['field1', 'field2', 'cntType']);
			schemaStub.mixedPathsInit['field1.field2.connections']['field1.field2.connId'].conditions.should.match({type : String, required : true});
			schemaStub.mixedPathsInit['field1.field2.connections']['field1.field2.connId'].pathArray.should.match(['field1', 'field2', 'connId']);

			schemaStub.hasMixed.should.be.ok;
		});

		it('should parse conditions for nested mixed fields', function () {
			var conditions = {
				field1 : {type : "mixed", mixed : {
						votes : {
							cntId : {type : String, required : true},
							cntType : {type : Number, required : true},
							attrs : {type : "mixed", mixed : {
									pluses : {
										plus : {type : Boolean, required : true}
									},
									minuses : {
										minus : {type : Boolean, required : true}
									}
								}
							}
						},
						connections : {
							connId : {type : String, required : true} 
						}
					}
				}
			};

			schemaStub.add(conditions);

			// console.log(util.inspect(schemaStub.mixedPathsInit, {depth : null}));

			schemaStub.mixedPathsInit['field1.votes']['field1.cntId'].conditions.should.match({type : String, required : true});
			schemaStub.mixedPathsInit['field1.votes']['field1.cntId'].pathArray.should.match(['field1', 'cntId']);
			schemaStub.mixedPathsInit['field1.votes']['field1.cntType'].conditions.should.match({type : Number, required : true});
			schemaStub.mixedPathsInit['field1.votes']['field1.cntType'].pathArray.should.match(['field1', 'cntType']);
			schemaStub.mixedPathsInit['field1.votes.attrs.pluses']['field1.attrs.plus'].conditions.should.match({type : Boolean, required : true});
			schemaStub.mixedPathsInit['field1.votes.attrs.pluses']['field1.attrs.plus'].pathArray.should.match(['field1', 'attrs', 'plus']);
			schemaStub.mixedPathsInit['field1.votes.attrs.minuses']['field1.attrs.minus'].conditions.should.match({type : Boolean, required : true});
			schemaStub.mixedPathsInit['field1.votes.attrs.minuses']['field1.attrs.minus'].pathArray.should.match(['field1', 'attrs', 'minus']);
			schemaStub.mixedPathsInit['field1.connections']['field1.connId'].conditions.should.match({type : String, required : true});
			schemaStub.mixedPathsInit['field1.connections']['field1.connId'].pathArray.should.match(['field1', 'connId']);
		});
	});
});