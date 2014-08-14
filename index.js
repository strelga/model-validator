"use strict";

var _ = require('underscore');

var ValidationError = require('./lib/error');
var select = require('./lib/types/select');

var Schema = module.exports = function (conditions, options) {
    this.throws = (options && (typeof options.throws !== "undefined")) ? options.throws : true;

    this.pathsInit = {};
    this.paths = {};

    this.hasMixed = false;
    this.mixedPathsInit = {};
    this.mixedPaths = {};

    this.constraints = {};

    this.add(conditions);

    this.cast();
};

var isObject = function (arg) {
  return '[object Object]' == toString.call(arg);
}

var isCondition = function (element) {
    return !isObject(element) || (element.type && !element.type.type) || !(Object.keys(element).length);
};

var hasMixedField = function (element) {
    return !!(element.mixed);
}

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

/**
 * Gets object of conditions and transformes it into set of regular paths
 * and mixed paths, changes variables this.pathsInit, this.mixedPathsInit and sets
 * this.hasMixed to true if there are mixed fields in conditions.
 *
 * example:
 * obj = {
 *   field1 : {type : "mixed", mixed : {
 *           votes : {
 *               cntId : {type : String, required : true},
 *               cntType : {type : Number, required : true},
 *               attrs : {type : "mixed", mixed : {
 *                       pluses : {
 *                           plus : {type : Boolean, required : true}
 *                       },
 *                       minuses : {
 *                           minus : {type : Boolean, required : true}
 *                       }
 *                   }
 *               }
 *           },
 *           connections : {
 *               connId : {type : String, required : true} 
 *           }
 *       }
 *   }
 *
 * this.mixedPathsInit = { 'field1.votes': 
 *  { 'field1.cntId': 
 *     { conditions: { type: [Function: String], required: true },
 *       pathArray: [ 'field1', 'cntId' ] },
 *    'field1.cntType': 
 *     { conditions: { type: [Function: Number], required: true },
 *       pathArray: [ 'field1', 'cntType' ] } },
 * 'field1.votes.attrs.pluses': 
 *  { 'field1.attrs.plus': 
 *     { conditions: { type: [Function: Boolean], required: true },
 *       pathArray: [ 'field1', 'attrs', 'plus' ] } },
 * 'field1.votes.attrs.minuses': 
 *  { 'field1.attrs.minus': 
 *     { conditions: { type: [Function: Boolean], required: true },
 *       pathArray: [ 'field1', 'attrs', 'minus' ] } },
 * 'field1.connections': 
 *  { 'field1.connId': 
 *     { conditions: { type: [Function: String], required: true },
 *       pathArray: [ 'field1', 'connId' ] } } }
 * 
 * @param {Object} obj                The object of conditions.
 * @param {Object} prefix             The object containing prefix array and prefix string.
 *                                      prefix = { string : 'field1.field2', array : ['field1', 'field2'] }
 * @param {Object} mixedPrefixStrings The object containing full prefix string and current prefix string
 *                                    for plain mixed fields and nested mixed fields.
 *                                      mixedPrefixStrings = {
 *                                          current : 'field1.mixed1',
 *                                          full : 'field1.mixed1.field2'
 *                                      }
 */
Schema.prototype.add = function (obj, prefix, mixedPrefixStrings) {
    if (!prefix) {
        prefix = {
            string : '',
            array : []
        }
    }

    if (!mixedPrefixStrings) {
        mixedPrefixStrings = {
            current : '',
            full : ''
        };
    }

    for (var key in obj) {
        if (isCondition(obj[key])) {
            if (hasMixedField(obj[key])) {
                // there is the field 'mixed' in obj[key]
                this.hasMixed = true;

                for (var mixedKey in obj[key].mixed) {
                    var nextMixedPrefixStrings = {};
                    
                    nextMixedPrefixStrings.current = makePathString(makePathString(mixedPrefixStrings.full, key), mixedKey);
                    nextMixedPrefixStrings.full = nextMixedPrefixStrings.current;
                    
                    var nextPrefix = {
                        string : makePathString(prefix.string, key),
                        array : makePathArray(prefix.array, key)
                    };

                    this.add(obj[key]['mixed'][mixedKey], nextPrefix, nextMixedPrefixStrings);
                }
            } else {
                // there is no field 'mixed' in obj[key] and obj[key] is just a condition
                var value = {
                    conditions : obj[key],
                    pathArray : makePathArray(prefix.array, key)
                };

                var path = makePathString(prefix.string, key);

                if (mixedPrefixStrings.current) {
                    if (!this.mixedPathsInit[mixedPrefixStrings.current]) {
                        this.mixedPathsInit[mixedPrefixStrings.current] = {};
                    }
                    this.mixedPathsInit[mixedPrefixStrings.current][path] = value;
                } else {
                    this.pathsInit[path] = value;
                }
            }
        } else {
            // obj[key] is just another nested object, go deeper through it
            var nextPrefix = {
                string : makePathString(prefix.string, key),
                array : makePathArray(prefix.array, key)
            }

            mixedPrefixStrings.full = makePathString(mixedPrefixStrings.full, key);

            this.add(obj[key], nextPrefix, mixedPrefixStrings);
        }
    }
};


/**
 * Validates the object obj using precompiled constraints.
 * If mixed paths are specified, validates them too.
 * 
 * @param  {Object} obj         The object to be validated.
 * @param  {String} mixedPath1  The first mixed path.
 * @param  {String} mixedPath2  The second mixed path.
 * ... and so on, arbitrary number of mixedPaths can be specified
 * if this.throws === true:
 * @return {Object}     The resulting object with defaults substituted.
 * @throws {ValidationError}    If some constraints were unmet.
 * if this.throws === false:
 * @return {Object}     {
 *                         ok : true|false,
 *                         msgs : {Error messages here},
 *                         obj : {The resulting object}
 *                      }
 * 
 * @api public
 */
Schema.prototype.validate = function (obj, mixedPath) {
    var retObj = {};
    var results = {
        ok : true,
        msgs : {}
    }

    this.validateByPaths(obj, this.paths, retObj, results);

    for (var i = 1, l = arguments.length; i < l; i++) {
        var mixedPath = arguments[i];

        var paths = this.mixedPaths[mixedPath];
        if (paths) {
            this.validateByPaths(obj, paths, retObj, results);
        }
    }

    if (this.throws) {
        if (!results.ok) {
            throw new ValidationError(results.msgs);
        }
        return retObj;
    } else {
        results.obj = retObj;
        return results;
    }
};

Schema.prototype.validateByPaths = function (obj, paths, retObj, results) {
    // don't use for (path in this.paths) here because it is 2 times slower
    var pathKeys = Object.keys(paths);

    for (var i = 0, l = pathKeys.length; i < l; i++) {
        var path = pathKeys[i];
        var param = paths[path];

        var result = this.validateField(obj, param.constraints, param.pathArray, retObj);

        if (!result.ok) {
            results.ok = false;
            results.msgs[path] = result.msg;
        }
    }
};

function isIn(key, obj) {
    if ((typeof obj === "object") && (key in obj)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Validates the field specified with pathArray using constaints.
 * Builds retObj - the object to return after validation of all fields.
 * retObj differs from obj in substituting the defaults to fields.
 *
 * The algorithm.
 * - Iterate over object according to pathArray and build retObj. Pass the value
 * of the given field to assert function of the constraints object.
 * - If during the iteration we encounter that there is no such field in obj,
 * check whether default is set.
 * -- If default is set, continue creating retObj and set the value in it to default.
 * -- If default is not set, check whether the field is required.
 * --- If it is required, return from field validator with error.
 * --- If it is not required, return from field validator with {ok : true}.
 * 
 * @param  {Object} obj         The object containing the field to be validated.
 * @param  {Object} constraints The object containing the default value if present and the assert function.
 * @param  {Array} pathArray   The path to the field in obj to be validated.
 * @param  {Object} retObj      The object to be returned from entire validator.
 * @return {Object}             The result of validation of the field.
 */
Schema.prototype.validateField = function (obj, constraints, pathArray, retObj) {
    var current = obj;
    var currentRet = retObj;
    var noSuchFieldInObj = false;

    for (var i = 0, l = pathArray.length; i < l; i++) {
        var key = pathArray[i];

        if (isIn(key, current)) {
            current = current[key];
        } else {
            // if we are here, there was no such field in obj
            if (constraints.default === undefined) {
                if (constraints.required === true) {
                    return {
                        ok : false,
                        msg : "Is required. Now it is absent."
                    };
                } else {
                    return {
                        ok : true
                    };
                }
            }
            noSuchFieldInObj = true;
        }

        if (!isIn(key, currentRet)) {
            if (i !== l-1) {
                currentRet[key] = {};
            } else {
                currentRet[key] = current;
                break;
            }
        }

        currentRet = currentRet[key];
    }

    if (noSuchFieldInObj) {
        // If we get here, constraints.default is set, because otherwise
        // we would have returned from the function
        currentRet[key] = constraints.default;
    }

    var result = constraints.assert(currentRet[key]);

    return result;
}

/**
 * Casts paths with conditions (this.pathsInit) to paths with constraints object (this.paths).
 *
 *  pathsInit = {
 *      'field1' : {
 *          conditions : {type : String, required : true, default : hello}
 *          pathArray : ['field1']
 *      },
 *      'field2.field3' : {
 *          conditions : {type : Boolean, default : true},
 *          pathArray : ['field2', 'field3']
 *      }
 *  }
 *  
 *  -> casts to ->
 *  
 *  paths = {
 *      'field1' : {
 *          constraints : {
 *              default : 'hello',
 *              required : true,
 *              assert : function (element) {
 *                  return isString(element);
 *              }
 *          },
 *          pathArray : ['field1']
 *      },
 *      'field2.field3' : {
 *          constraints : {
 *              default : true,
 *              required : false,
 *              assert : function (element) {
 *                  return isBoolean(element);
 *              }
 *          },
 *          pathArray : ['field2', 'field3']
 *      }
 *  }
 * 
 * @api private
 */
Schema.prototype.cast = function () {
    for (var path in this.pathsInit) {
        this.paths[path] = {
            constraints : condsToConstrs(this.pathsInit[path].conditions),
            pathArray : this.pathsInit[path].pathArray
        };
    }

    for (var mixedPath in this.mixedPathsInit) {
        this.mixedPaths[mixedPath] = {};
        for (var path in this.mixedPathsInit[mixedPath]) {
            this.mixedPaths[mixedPath][path] = {
                constraints : condsToConstrs(this.mixedPathsInit[mixedPath][path].conditions),
                pathArray : this.mixedPathsInit[mixedPath][path].pathArray
            };
        }
    }
};

/**
 * Transforms conditions of the form {type : String, required : true, default : 'hello'}
 * to constraints of the form 
 * {
 *     default : 'hello',
 *     required : true,
 *     assert : function (value) {
 *         return isString(value) && isRequired(value); // the actual assertions are more complex
 *     }
 * }
 * @param  {Object} conditions 
 * @return {Object}            Object of constraints.
 */
function condsToConstrs(conditions) {
    var constraints = {};
    if (typeof conditions.default !== 'undefined') {
        constraints.default = conditions.default;
        delete conditions.default;
    }
    if ('required' in conditions) {
        if (conditions.required === true) {
            constraints.required = conditions.required;
        }
        delete conditions.required;
    } else {
        constraints.required = false;
    }

    var validator = select.validator(conditions.type);
    constraints.assert = validator.getFullValueValidator(conditions);

    return constraints;
}