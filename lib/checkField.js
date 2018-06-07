"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkField;

var _predicate = require("predicate");

var _predicate2 = _interopRequireDefault(_predicate);

var _utils = require("./utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var doCheckField = function doCheckField(fieldVal, rule) {
  if ((0, _utils.isObject)(rule)) {
    return Object.keys(rule).every(function (p) {
      var subRule = rule[p];
      if (p === _constants.OR || p === _constants.AND) {
        if (Array.isArray(subRule)) {
          if (p === _constants.OR) {
            return subRule.some(function (rule) {
              return doCheckField(fieldVal, rule);
            });
          } else {
            return subRule.every(function (rule) {
              return doCheckField(fieldVal, rule);
            });
          }
        } else {
          return false;
        }
      } else if (p === _constants.NOT) {
        return !doCheckField(fieldVal, subRule);
      } else if (_predicate2.default[p]) {
        return _predicate2.default[p](fieldVal, subRule);
      } else {
        return false;
      }
    });
  } else {
    return _predicate2.default[rule](fieldVal);
  }
};

function checkField(fieldVal, rule) {
  return doCheckField(fieldVal, rule);
}