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
	
	this.hasMixed = false;
	this.mixedPaths = {};

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

var isCondition = function (element) {
	return !isObject(element) || (element.type && !element.type.type) || !(Object.keys(element).length);
};

var hasMixedField = function (element) {
	return !!(element.mixed);
}

/**
 * [query] Transforms the object of conditions to the object of paths.
 * 
 * @param {Object} obj The object of conditions.
 * @return {Object} The object of paths.
 */
// Schema.prototype.add = function (obj) {
// 	var paths = {};

// 	if (!isObject(obj)) {
// 		obj = {};
// 	}

// 	for (var key in obj) {
// 		if (isCondition(obj[key])) {
// 			if (hasMixedField(obj)) {

// 			} else {
// 				paths[key] = {
// 					conditions : obj[key],
// 					pathArray : [key]
// 				};
// 			}
// 		} else {
// 			var subpaths = this.add(obj[key]);

// 		    for (var subPathKey in subpaths) {
// 			    var pathKey = key + '.' + subPathKey;

// 			    subpaths[subPathKey]['pathArray'].unshift(key)
// 		    	paths[pathKey] = {
// 		    		conditions : subpaths[subPathKey]['conditions'],
// 		    		pathArray : subpaths[subPathKey]['pathArray']
// 		    	}
// 		    }
// 		}
// 	}

// 	return paths;
// };

var makePathString = function (prefixString, key) {
	return (prefixString) 
		? prefixString + '.' + key
		: key;
};

var makePathArray = function (prefixArray, key) {
	var pathArray = prefixArray.slice();
	pathArray.push(key);
	
	return pathArray;
}

Schema.prototype.add = function (obj, prefix, mixedPrefixString) {
	if (!prefix) {
		prefix = {
			string : undefined,
			array : []
		}
	}

	for (var key in obj) {
		if (isCondition(obj[key])) {
			if (hasMixedField(obj[key])) {
				// there is the field 'mixed' in obj[key]
				this.hasMixed = true;

				for (var mixedKey in obj[key].mixed) {
					var nextMixedPrefixString = makePathString(makePathString(prefix.string, key), mixedKey);
					var nextPrefix = {
						string : makePathString(prefix.string, key),
						array : makePathArray(prefix.array, key)
					};

					this.add(obj[key]['mixed'][mixedKey], nextPrefix, nextMixedPrefixString);
				}
			} else {
				// there is no field 'mixed' in obj[key] and obj[key] is just a condition
				var path = {
					conditions : obj[key],
					pathArray : makePathArray(prefix.array, key)
				};

				if (mixedPrefixString) {
					this.mixedPaths[mixedPrefixString] = path;
				} else {
					var pathString = makePathString(prefix.string, key);
					this.paths[pathString] = path;
				}
			}
		} else {
			// obj[key] is just another nested object, go deeper through it
			var nextPrefix = {
				string : makePathString(prefix.string, key),
				array : makePathArray(prefix.array, key)
			}

			this.add(obj[key], nextPrefix, mixedPrefixString);
		}
	}
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