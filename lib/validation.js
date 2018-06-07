"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.predicatesFromRule = predicatesFromRule;
exports.predicatesFromCondition = predicatesFromCondition;
exports.listAllPredicates = listAllPredicates;
exports.listInvalidPredicates = listInvalidPredicates;
exports.validatePredicates = validatePredicates;
exports.fieldsFromPredicates = fieldsFromPredicates;
exports.fieldsFromCondition = fieldsFromCondition;
exports.listAllFields = listAllFields;
exports.listInvalidFields = listInvalidFields;
exports.validateConditionFields = validateConditionFields;

var _predicate = require("predicate");

var _predicate2 = _interopRequireDefault(_predicate);

var _utils = require("./utils");

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var UNSUPPORTED_PREDICATES = ["and", "or", "ternary", "every", "some", "curry", "partial", "complement", "mod"];

function predicatesFromRule(rule, schema) {
  if ((0, _utils.isObject)(rule)) {
    return (0, _utils.flatMap)(Object.keys(rule), function (p) {
      var comparable = rule[p];
      if ((0, _utils.isObject)(comparable) || p === _constants.NOT) {
        if (p === _constants.OR || p === _constants.AND) {
          if (Array.isArray(comparable)) {
            return (0, _utils.flatMap)(comparable, function (condition) {
              return predicatesFromRule(condition, schema);
            });
          } else {
            (0, _utils.toError)("\"" + p + "\" must be an array");
            return [];
          }
        } else {
          var predicates = predicatesFromRule(comparable, schema);
          predicates.push(p);
          return predicates;
        }
      } else {
        return predicatesFromRule(p, schema);
      }
    });
  } else {
    return [rule];
  }
}

function predicatesFromCondition(condition, schema) {
  return (0, _utils.flatMap)(Object.keys(condition), function (ref) {
    var refVal = condition[ref];
    ref = (0, _utils.normRef)(ref);
    if (ref === _constants.OR || ref === _constants.AND) {
      if (Array.isArray(refVal)) {
        return (0, _utils.flatMap)(refVal, function (c) {
          return predicatesFromCondition(c, schema);
        });
      } else {
        (0, _utils.toError)(ref + " with " + JSON.stringify(refVal) + " must be an Array");
        return [];
      }
    } else if (ref === _constants.NOT) {
      return predicatesFromCondition(refVal, schema);
    } else if (ref.indexOf(".") !== -1) {
      var separator = ref.indexOf(".");
      var schemaField = ref.substr(0, separator);
      var subSchema = (0, _utils.extractRefSchema)(schemaField, schema);

      if (subSchema) {
        var subSchemaField = ref.substr(separator + 1);
        var newCondition = _defineProperty({}, subSchemaField, refVal);
        return predicatesFromCondition(newCondition, subSchema);
      } else {
        (0, _utils.toError)("Can't find schema for " + schemaField);
        return [];
      }
    } else if ((0, _utils.isRefArray)(ref, schema)) {
      var refSchema = (0, _utils.extractRefSchema)(ref, schema);
      return refSchema ? predicatesFromCondition(refVal, refSchema) : [];
    } else if (schema.properties[ref]) {
      return predicatesFromRule(refVal, schema);
    } else {
      (0, _utils.toError)("Can't validate " + ref);
      return [];
    }
  });
}

function listAllPredicates(conditions, schema) {
  var allPredicates = (0, _utils.flatMap)(conditions, function (condition) {
    return predicatesFromCondition(condition, schema);
  });
  return allPredicates.filter(function (v, i, a) {
    return allPredicates.indexOf(v) === i;
  });
}

function listInvalidPredicates(conditions, schema) {
  var refPredicates = listAllPredicates(conditions, schema);
  return refPredicates.filter(function (p) {
    return UNSUPPORTED_PREDICATES.includes(p) || _predicate2.default[p] === undefined;
  });
}

function validatePredicates(conditions, schema) {
  var invalidPredicates = listInvalidPredicates(conditions, schema);
  if (invalidPredicates.length !== 0) {
    (0, _utils.toError)("Rule contains invalid predicates " + invalidPredicates);
  }
}

function fieldsFromPredicates(predicate) {
  if (Array.isArray(predicate)) {
    return (0, _utils.flatMap)(predicate, fieldsFromPredicates);
  } else if ((0, _utils.isObject)(predicate)) {
    return (0, _utils.flatMap)(Object.keys(predicate), function (field) {
      var predicateValue = predicate[field];
      return fieldsFromPredicates(predicateValue);
    });
  } else if (typeof predicate === "string" && predicate.startsWith("$")) {
    return [predicate.substr(1)];
  } else {
    return [];
  }
}

function fieldsFromCondition(condition) {
  return (0, _utils.flatMap)(Object.keys(condition), function (ref) {
    var refCondition = condition[ref];
    if (ref === _constants.OR || ref === _constants.AND) {
      return (0, _utils.flatMap)(refCondition, fieldsFromCondition);
    } else if (ref === _constants.NOT) {
      return fieldsFromCondition(refCondition);
    } else {
      return [(0, _utils.normRef)(ref)].concat(fieldsFromPredicates(refCondition));
    }
  });
}

function listAllFields(conditions) {
  var allFields = (0, _utils.flatMap)(conditions, fieldsFromCondition);
  return allFields.filter(function (field) {
    return field.indexOf(".") === -1;
  }).filter(function (v, i, a) {
    return allFields.indexOf(v) === i;
  });
}

function listInvalidFields(conditions, schema) {
  var allFields = listAllFields(conditions);
  return allFields.filter(function (field) {
    return schema.properties[field] === undefined;
  });
}

function validateConditionFields(conditions, schema) {
  var invalidFields = listInvalidFields(conditions, schema);
  if (invalidFields.length !== 0) {
    (0, _utils.toError)("Rule contains invalid fields " + invalidFields);
  }
}