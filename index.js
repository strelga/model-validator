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
 * and mixed paths, changes variables this.paths, this.mixedPaths and sets
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
 * this.mixedPaths = { 'field1.votes': 
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
            string : undefined,
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
                var path = {
                    conditions : obj[key],
                    pathArray : makePathArray(prefix.array, key)
                };

                var pathString = makePathString(prefix.string, key);

                if (mixedPrefixStrings.current) {
                    if (!this.mixedPaths[mixedPrefixStrings.current]) {
                        this.mixedPaths[mixedPrefixStrings.current] = {};
                    }
                    this.mixedPaths[mixedPrefixStrings.current][pathString] = path;
                } else {
                    this.paths[pathString] = path;
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
 *  paths = {
 *      'field1' : {
 *          conditions : {type : String, required : true}
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
 *  constraints = {
 *      'field1' : {
 *          constraints : {
 *              default : undefined,
 *              required : true,
 *              check : function (element) {
 *                  return isString(element);
 *              }
 *          },
 *          pathArray : ['field1']
 *      },
 *      'field2.field3' : {
 *          constraints : {
 *              default : true,
 *              required : false,
 *              check : function (element) {
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
};