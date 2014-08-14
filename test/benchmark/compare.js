"use strict";

var ZSchema = require('z-schema');
var Schema = require('../../');

var N = 10000;

var SchemaPattern = {
	num1 : {type : Number, required : true},
	bool1 : {type : Boolean, required : true},
	obj1 : {
		date1 : {type : Date, required : true},
		str1 : {type : String, required : true, default : 'Hi, guys!'}
	}
};

function getJsons() {
	var jsons = [];

	for (var i = 0; i < N; i++) {
		jsons.push({
			num1 : Math.floor(Math.random() * (N + 1)),
			bool1 : true,
			obj1 : {
				date1 : new Date(),
				str1 : "Hello, " + Math.floor(Math.random() * (N + 1)) + "."
			}
		});
	}

	return jsons;
}

function validateSchemaNoThrowBenchmark(jsons) {
	var schema = new Schema(SchemaPattern, {throws : false});

	var before = new Date();
	for (var i = 0; i < N; i++) {
		var res = schema.validate(jsons[i]);
		// console.log(res);
		if (!res.ok) {
			console.log(res.msgs);
		}
	}
	var after = new Date();

	var time = after - before;
	var timePerOperation = time / N;

	console.log('Schema no throw -> %d milliseconds per operation', timePerOperation);
}

function validateSchemaThrowBenchmark(jsons) {
	var schema = new Schema(SchemaPattern, {throws : true});

	var before = new Date();
	for (var i = 0; i < N; i++) {
		try {
			var obj = schema.validate(jsons[i]);
		} catch (e) {
			console.log(e);
		}
	}
	var after = new Date();

	var time = after - before;
	var timePerOperation = time / N;

	console.log('Schema throw -> %d milliseconds per operation', timePerOperation);
}

function validateZSchemaBenchmark(jsons) {
	var validator = new ZSchema({sync : true});

	var schema = {
		type : "object",
		properties : {
			num1 : {type : "number"},
			bool1 : {type : "boolean"},
			obj1 : {
				type : "object",
				properties : {
					date1 : {type : "object"},
					str1 : {type : "string"}
				},
				required : ["date1", "str1"]
			}
		},
		required : ["num1", "bool1"]
	};

	var before = new Date();
	for (var i = 0; i < N; i++) {
		var valid = validator.validate(jsons[i], schema);
		if (!valid) {
			console.log(validator.getLastError());
		}
	}
	var after = new Date();

	var time = after - before;
	var timePerOperation = time / N;

	console.log('ZSchema -> %d milliseconds per operation', timePerOperation);
}

var jsons = getJsons();

validateZSchemaBenchmark(jsons);
validateSchemaNoThrowBenchmark(jsons);
validateSchemaThrowBenchmark(jsons);