"use strict";

var util = require('util');

var sinon = require('sinon');

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

	describe('#cast', function () {
		var schemaStub;

		beforeEach(function () {
			var SchemaStub = function () {
				this.pathsInit = {};
				this.hasMixed = false;
				this.mixedPathsInit = {};

				this.paths = {};
				this.mixedPaths = {}
			};

			SchemaStub.prototype.add = Schema.prototype.add;

			SchemaStub.prototype.cast = Schema.prototype.cast;

			schemaStub = new SchemaStub();
		});

		it('should cast pathsInit to paths', function () {
			var conditions = {
				field1 : { type : String, required : true },
				field2 : {
					field3 : { type : String, required : false, default : 'hello' },
				}
			};

			schemaStub.add(conditions);

			schemaStub.cast();

			(schemaStub.paths['field1'].constraints.default === undefined).should.be.ok;
			schemaStub.paths['field1'].constraints.assert.should.be.type('function');
			schemaStub.paths['field1'].pathArray.should.match(['field1']);
			schemaStub.paths['field2.field3'].constraints.default.should.match(/hello/);
			schemaStub.paths['field2.field3'].constraints.assert.should.be.type('function');
			schemaStub.paths['field2.field3'].pathArray.should.match(['field2', 'field3']);
		});

		it('should cast mixedPathsInit to mixedPaths', function () {
			var conditions = {
				field1 : {
					type : 'mixed', mixed : {
						votes : { 
							cntId : {type : String, required : true}
						},
						connections : {
							connId : {type : String, required : true, default : '1'}
						}
					}
				}
			};

			schemaStub.add(conditions);

			schemaStub.cast();

			(schemaStub.mixedPaths['field1.votes']['field1.cntId'].constraints.default === undefined).should.be.ok;
			schemaStub.mixedPaths['field1.votes']['field1.cntId'].constraints.assert.should.be.type('function');
			schemaStub.mixedPaths['field1.votes']['field1.cntId'].pathArray.should.match(['field1', 'cntId']);
			schemaStub.mixedPaths['field1.connections']['field1.connId'].constraints.default.should.match('1');
			schemaStub.mixedPaths['field1.connections']['field1.connId'].constraints.assert.should.be.type('function');
			schemaStub.mixedPaths['field1.connections']['field1.connId'].pathArray.should.match(['field1', 'connId']);
		});
	});

	describe('#validateField', function () {
		var obj;
		var retObj;
		var constraints;
		var pathArray;

		it('should augment retObj with additional fields if they are in obj', function () {
			var obj = {
				field1 : {
					field2 : 'hello',
					field3 : 'world'
				},
				field4 : 'hi, guys'
			};

			var retObj = {
				field1 : {
					field2 : 'hello'
				}
			};

			var constraints = {
				default : 'world',
				assert : function () {return {ok:true}}
			};

			var spy = sinon.spy(constraints, 'assert');

			var pathArray = ['field1', 'field3'];

			var result = Schema.prototype.validateField(obj, constraints, pathArray, retObj);

			retObj.field1.field3.should.match('world');
			spy.withArgs('world').calledOnce.should.be.ok;
		});

		it('should augment retObj with additional fields if they are not in obj and default is set', function () {
			var obj = {
				field1 : {
					field2 : 'hello'
				},
				field4 : 'hi, guys'
			};

			var retObj = {
				field1 : {
					field2 : 'hello'
				}
			};

			var constraints = {
				default : 'world',
				assert : function () {return {ok:true}}
			};

			var spy = sinon.spy(constraints, 'assert');

			var pathArray = ['field1', 'field3'];

			var result = Schema.prototype.validateField(obj, constraints, pathArray, retObj);

			// console.log(retObj);

			retObj.field1.field3.should.match('world');
			spy.withArgs('world').calledOnce.should.be.ok;
		});

		it('should not augment retObj if the field from pathArray is not in obj and default is not given', function () {
			var obj = {
				field1 : {
					field2 : 'hello'
				},
				field4 : 'hi, guys'
			};

			var retObj = {
				field1 : {
					field2 : 'hello'
				}
			};

			var constraints = {
				assert : function () {return {ok:true}}
			};

			var spy = sinon.spy(constraints, 'assert');

			var pathArray = ['field1', 'field3'];

			var result = Schema.prototype.validateField(obj, constraints, pathArray, retObj);

			// console.log(retObj);

			('field3' in retObj.field1).should.be.not.ok;
			spy.called.should.be.not.ok;
		});

		it('should return ok:false if the field from pathArray is not in obj, default is not given, but required is true', function () {
			var obj = {
				field1 : {
					field2 : 'hello'
				},
				field4 : 'hi, guys'
			};

			var retObj = {
				field1 : {
					field2 : 'hello'
				}
			};

			var constraints = {
				default : undefined,
				required : true,
				assert : function () {return {ok:true}}
			};

			var spy = sinon.spy(constraints, 'assert');

			var pathArray = ['field1', 'field3'];

			var result = Schema.prototype.validateField(obj, constraints, pathArray, retObj);

			result.ok.should.be.not.ok;
			result.msg.should.be.type('string');

		});
	});
});