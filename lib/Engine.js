"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _validation = require("./validation");

var _applicableActions = require("./applicableActions");

var _applicableActions2 = _interopRequireDefault(_applicableActions);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var validate = function validate(schema) {
  var isSchemaDefined = schema !== undefined && schema !== null;
  if ((0, _utils.isDevelopment)() && isSchemaDefined) {
    if (!(0, _utils.isObject)(schema)) {
      (0, _utils.toError)("Expected valid schema object, but got - " + schema);
    }
    return function (rule) {
      (0, _validation.validatePredicates)([rule.conditions], schema);
      (0, _validation.validateConditionFields)([rule.conditions], schema);
    };
  } else {
    return function () {};
  }
};

var Engine = function Engine(rules, schema) {
  var _this = this;

  _classCallCheck(this, Engine);

  this.addRule = function (rule) {
    _this.validate(rule);
    _this.rules.push(rule);
  };

  this.run = function (formData) {
    return Promise.resolve((0, _applicableActions2.default)(_this.rules, formData));
  };

  this.rules = [];
  this.validate = validate(schema);

  if (rules) {
    (0, _utils.toArray)(rules).forEach(function (rule) {
      return _this.addRule(rule);
    });
  }
};

exports.default = Engine;