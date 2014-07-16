"use strict";

var Validator = module.exports = function (conditions) {
    this.validators = {};
};

Validator.prototype.getAssert = function (funcArray) {
    return function (value) {
        var ret;

        for (var i = 0, l = funcArray.length; i < l; i++) {
            ret = funcArray[i](value);
            if (!ret.ok) {
                return ret;
            }
        }

        return ret;
    }
};

Validator.prototype.getFullValueValidator = function (conditions) {
    var requiredValidators = [];

    if (!this.validators.type) {
        throw new Error('There is no type validator, please push it to the set of validators this.validators.');
    }
    requiredValidators.push(this.validators.type);

    for (var key in conditions) {
        var validator = this.validators[key];

        if (validator) {
            requiredValidators.push(validator);
        } else {
            throw new Error('There is no validator ' + key + ' among possible validators.');
        }
    }

    return this.getAssert(requiredValidators);
}

// Validator.prototype.assertRequired = function (value) {
//     var ret = {};
//     if (typeof value === 'undefined') {
//         ret.ok = false;
//         ret.msg = 'Is required, undefined is passed instead.';
//     } else {
//         ret.ok = true;
//     }
//     return ret;
// };