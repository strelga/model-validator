// var paths = {};

// var isObject = function (arg) {
//   return '[object Object]' == toString.call(arg);
// }

// function addToPaths(obj, prefix) {
// 	prefix = prefix || '';

// 	var keys = Object.keys(obj);

// 	for (var i = 0, l = keys.length; i < l; i++) {
// 		var key = keys[i];

// 		if (isObject(obj[key]) && (!obj[key].type || obj[key].type.type)) {
// 			if (Object.keys(obj[key]).length) {
// 		        // nested object { last: { name: String } }
// 		        addToPaths(obj[key], prefix + key + '.');
// 			} else {
// 				paths[prefix + key] = obj[key]; // mixed type
// 		    }
// 		} else {
// 			paths[prefix + key] = obj[key];
// 		}
// 	}
// }

// var schema = {
// 	userId1 : { type : String, required : true },
// 	userId2 : { type : String, required : true },
// 	userIds : [String],
// 	attrs : {
// 		cntId : { type : String, required : true },
// 		cntType : { type : Number, required : true },
// 		user1 : {
// 			voteType : { type : Number, required : true }
// 		},
// 		user2 : {
// 			voteType : { type : Number, required : true }
// 		}
// 	}
// };

// addToPaths(schema);

// console.log(paths);

"use strict";

var isObject = function (arg) {
  return '[object Object]' == toString.call(arg);
}

var Schema = module.exports = function (conditions) {
	this.paths = {};
	this.constraints = {};

	this.add(conditions);

	this.cast();
};

// Schema.prototype.add = function (obj, prefix) {
// 	prefix = prefix || '';

// 	if (!isObject(obj)) {
// 		obj = {};
// 	}

// 	var keys = Object.keys(obj);

// 	for (var i = 0, l = keys.length; i < l; i++) {
// 		var key = keys[i];

// 		if (isObject(obj[key]) && (!obj[key].type || obj[key].type.type) && (Object.keys(obj[key]).length)) {
// 		    this.add(obj[key], prefix + key + '.');
// 		} else {
// 			this.paths[prefix + key][conditions] = obj[key];
// 		}
// 	}
// };

var isNotCondition = function (element) {
	return isObject(element) && (!element.type || element.type.type) && (Object.keys(element).length);
};

Schema.prototype.add = function (obj) {
	var paths = {};

	if (!isObject(obj)) {
		obj = {};
	}

	for (var key in obj) {
		if (isNotCondition(obj[key])) {
		    var subpaths = this.add(obj[key]);

		    for (var subPathKey in subpaths) {
			    var pathKey = key + '.' + subPathKey;

			    subpaths[subPathKey]['pathArray'].unshift(key)
		    	paths[pathKey] = {
		    		conditions : subpaths[subPathKey]['conditions'],
		    		pathArray : subpaths[subPathKey]['pathArray']
		    	}
		    }
		} else {
			paths[key] = {
				conditions : obj[key],
				pathArray : [key]
			};
		}
	}

	return paths;
};

/**
 * [validate description]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 *
 * @api private
 */
Schema.prototype.validate = function (obj) {

};

/**
 * Casts paths with conditions (this.paths) to paths with constraints object (this.constraints).
 *
 *	paths = {
 *		'field1' : {
 *			conditions : {type : String, required : true}
 *			pathArray : ['field1']
 *		},
 *		'field2.field3' : {
 *			conditions : {type : Boolean, default : true},
 *			pathArray : ['field2', 'field3']
 *		}
 *	}
 *	
 *	-> casts to ->
 *	
 *	constraints = {
 *		'field1' : {
 *			constraints : {
 *				default : undefined,
 *				required : true,
 *				check : function (element) {
 *					return isString(element);
 *				}
 *			},
 *			pathArray : ['field1']
 *		},
 *		'field2.field3' : {
 *			constraints : {
 *				default : true,
 *				required : false,
 *				check : function (element) {
 *					return isBoolean(element);
 *				}
 *			},
 *			pathArray : ['field2', 'field3']
 *		}
 *	}
 * 
 * @api private
 */
Schema.prototype.cast = function () {
};