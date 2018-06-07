"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = applicableActions;

var _utils = require("./utils");

var _conditionsMeet = require("./conditionsMeet");

var _conditionsMeet2 = _interopRequireDefault(_conditionsMeet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function applicableActions(rules, formData) {
  return (0, _utils.flatMap)(rules, function (_ref) {
    var conditions = _ref.conditions,
        event = _ref.event;

    if ((0, _conditionsMeet2.default)(conditions, formData)) {
      return (0, _utils.toArray)(event);
    } else {
      return [];
    }
  });
}