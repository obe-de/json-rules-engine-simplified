"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toRelCondition = toRelCondition;
exports.default = conditionsMeet;

var _utils = require("./utils");

var _checkField = require("./checkField");

var _checkField2 = _interopRequireDefault(_checkField);

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function toRelCondition(refCondition, formData) {
  if (Array.isArray(refCondition)) {
    return refCondition.map(function (cond) {
      return toRelCondition(cond, formData);
    });
  } else if ((0, _utils.isObject)(refCondition)) {
    return Object.keys(refCondition).reduce(function (agg, field) {
      agg[field] = toRelCondition(refCondition[field], formData);
      return agg;
    }, {});
  } else if (typeof refCondition === "string" && refCondition.startsWith("$")) {
    return (0, _utils.selectRef)(refCondition.substr(1), formData);
  } else {
    return refCondition;
  }
}

function conditionsMeet(condition, formData) {
  if (!(0, _utils.isObject)(condition) || !(0, _utils.isObject)(formData)) {
    (0, _utils.toError)("Rule " + JSON.stringify(condition) + " with " + formData + " can't be processed");
    return false;
  }
  return Object.keys(condition).every(function (ref) {
    var refCondition = condition[ref];
    if (ref === _constants.OR) {
      return refCondition.some(function (rule) {
        return conditionsMeet(rule, formData);
      });
    } else if (ref === _constants.AND) {
      return refCondition.every(function (rule) {
        return conditionsMeet(rule, formData);
      });
    } else if (ref === _constants.NOT) {
      return !conditionsMeet(refCondition, formData);
    } else {
      var refVal = (0, _utils.selectRef)(ref, formData);
      if (Array.isArray(refVal)) {
        var condMeatOnce = refVal.some(function (val) {
          return (0, _utils.isObject)(val) ? conditionsMeet(refCondition, val) : false;
        });
        // It's either true for an element in an array or for the whole array
        return condMeatOnce || (0, _checkField2.default)(refVal, toRelCondition(refCondition, formData));
      } else {
        return (0, _checkField2.default)(refVal, toRelCondition(refCondition, formData));
      }
    }
  });
}