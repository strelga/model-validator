"use strict";

var Validator = module.exports = function (conditions) {
    this.validators = {
        required : this.assertRequired
    };
};

Validator.prototype.getAssert = function (funcArray) {
    return function (value) {
        for (var i = 0, l = funcArray.length; i < l; i++) {
            var errMsg = funcArray[i](value);
            if (errMsg) {
                return errMsg;
            }
        }
    }
};

Validator.prototype.type = function () {
    throw new Error('The method "type" is not overridden.');
}

Validator.prototype.getFullValidator = function (conditions) {
    var requiredValidators = [];

    requiredValidators.push(this.validators.type);

    for (var key in conditions) {
        var validator = this.validators[key];

        if (validator) {
            requiredValidators.push(validator);
        } else {
            throw new Error('There is no option ' + key + ' for validation.');
        }
    }

    return this.getAssert(requiredValidators);
}

Validator.prototype.assertRequired = function (value) {
    if (typeof value === 'undefined') {
        return ' is required, undefined is passed instead.';
    }
};