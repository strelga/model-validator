"use strict";

var NumberValidator = require('../../lib/types/number');

var validator = new NumberValidator();

var assert = validator.getFullValidator({});

console.log(assert('5', 'field1.field2'));