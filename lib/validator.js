"use strict";

var Validator = module.exports = function (conditions) {
    this.validatorArray = [];
};

Validator.prototype.getAssert = function (funcArray) {
    return function (element) {
        var ret = {};
        var tempResult;

        for (var i = 0, l = funcArray.length; i < l; i++) {
            var errMsg = funcArray[i](element);
            if (errMsg) {
                return errMsg;            
            }
        }
    }
};